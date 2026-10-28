import { join } from "node:path";
import { fileURLToPath } from "node:url";
import postcss from "postcss";
import ts from "typescript";
import { componentFiles, packageComponents } from "../src/registry.js";
import { getComponent, type ComponentMeta } from "../src/index.js";

const tsconfig = fileURLToPath(new URL("../tsconfig.json", import.meta.url));

/** Ways a component folder disagrees with itself; empty when it is consistent. */
export async function checkComponent(name: string, root = packageComponents): Promise<string[]> {
  const { meta, files } = await getComponent(name, root);
  const [tsxPath = "", cssPath = ""] = componentFiles(name);
  const content = (path: string) => files.find((file) => file.path === path)?.content ?? "";
  const source = typeScriptSource(join(root, name, tsxPath));

  return [
    ...propDrift(meta, source),
    ...missingClasses(cssPath, content(tsxPath), content(cssPath)),
    ...foreignImports(meta, source.file),
  ];
}

interface Source {
  file: ts.SourceFile;
  checker: ts.TypeChecker;
}

// Compiles with the registry's own tsconfig, so the check sees what `tsc` sees.
function typeScriptSource(path: string): Source {
  const config = ts.getParsedCommandLineOfConfigFile(
    tsconfig,
    {},
    {
      ...ts.sys,
      onUnRecoverableConfigFileDiagnostic: (diagnostic) => {
        throw new Error(ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"));
      },
    },
  );
  const program = ts.createProgram([path], config?.options ?? {});
  const file = program.getSourceFile(path);
  if (file === undefined) throw new Error(`cannot read ${path}`);
  return { file, checker: program.getTypeChecker() };
}

// Every prop the component declares itself must be documented; documented props may also
// come from what it extends (e.g. isDisabled from React Aria).
function propDrift(meta: ComponentMeta, { file, checker }: Source): string[] {
  const typeName = `${meta.name.replace(/(?:^|-)(\w)/g, (_, letter: string) => letter.toUpperCase())}Props`;
  const moduleSymbol = checker.getSymbolAtLocation(file);
  const propsSymbol =
    moduleSymbol && checker.getExportsOfModule(moduleSymbol).find((s) => s.name === typeName);
  if (propsSymbol === undefined) return [`${meta.name}.tsx does not export ${typeName}`];

  const props = new Map(
    checker
      .getPropertiesOfType(checker.getDeclaredTypeOfSymbol(propsSymbol))
      .map((prop) => [prop.name, prop]),
  );
  const own = [...props.values()]
    .filter((prop) => prop.declarations?.some((node) => node.getSourceFile() === file))
    .map((prop) => prop.name);
  const documented = new Map(meta.props.map((prop) => [prop.name, prop]));

  return [
    ...[...documented.keys()]
      .filter((prop) => !props.has(prop))
      .map((prop) => `meta.json documents "${prop}", which ${typeName} does not have`),
    ...own
      .filter((prop) => !documented.has(prop))
      .map((prop) => `${typeName} declares "${prop}", which meta.json does not document`),
    ...[...documented.values()].flatMap((prop) => {
      const symbol = props.get(prop.name);
      if (symbol === undefined) return [];
      const required = (symbol.flags & ts.SymbolFlags.Optional) === 0;
      if (required === prop.required) return [];
      return required
        ? [`meta.json marks "${prop.name}" optional, but ${typeName} requires it`]
        : [`meta.json marks "${prop.name}" required, but ${typeName} makes it optional`];
    }),
  ];
}

function missingClasses(cssPath: string, tsx: string, css: string): string[] {
  const used = new Set(
    [...tsx.matchAll(/\bstyles(?:\.([A-Za-z_$][\w$]*)|\[["']([^"']+)["']\])/g)].map(
      (match) => match[1] ?? match[2] ?? "",
    ),
  );
  const defined = new Set<string>();
  postcss.parse(css).walkRules((rule) => {
    for (const match of rule.selector.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)) {
      defined.add(match[1] ?? "");
    }
  });
  return [...used]
    .filter((className) => !defined.has(className))
    .map((className) => `styles.${className} has no .${className} rule in ${cssPath}`);
}

// Components are copied into user projects, so they may import only what meta.json declares
// (AGENTS.md: no internal imports). Dynamic import() is not checked.
function foreignImports(meta: ComponentMeta, file: ts.SourceFile): string[] {
  const allowed = (specifier: string) =>
    specifier === "react" ||
    specifier === `./${meta.name}.module.css` ||
    meta.dependencies.some((dep) => specifier === dep || specifier.startsWith(`${dep}/`));

  return file.statements
    .flatMap((statement) =>
      (ts.isImportDeclaration(statement) || ts.isExportDeclaration(statement)) &&
      statement.moduleSpecifier !== undefined &&
      ts.isStringLiteral(statement.moduleSpecifier)
        ? [statement.moduleSpecifier.text]
        : [],
    )
    .filter((specifier) => !allowed(specifier))
    .map((specifier) => `imports "${specifier}", which meta.json does not list as a dependency`);
}
