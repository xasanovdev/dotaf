import { join } from "node:path";
import { fileURLToPath } from "node:url";
import postcss from "postcss";
import ts from "typescript";
import { componentFiles, packageComponents } from "../src/registry.js";
import { getComponent, listComponents, type ComponentMeta } from "../src/index.js";

const componentsTsconfig = fileURLToPath(new URL("../tsconfig.json", import.meta.url));

/** Ways a component folder disagrees with itself; empty when it is consistent. */
export async function checkComponent(name: string, root = packageComponents): Promise<string[]> {
  const { meta, files } = await getComponent(name, root);
  const [tsxPath = "", cssPath = ""] = componentFiles(name);
  const content = (path: string) => files.find((file) => file.path === path)?.content ?? "";
  const source = typeScriptSource(join(root, tsxPath));
  const registry = new Set((await listComponents(root)).map((component) => component.name));

  return [
    ...propDrift(meta, source),
    ...missingClasses(cssPath, content(tsxPath), content(cssPath)),
    ...foreignImports(meta, source.file),
    ...meta.registryDependencies
      .filter((dependency) => !registry.has(dependency))
      .map(
        (dependency) =>
          `registryDependencies lists "${dependency}", which the registry does not have`,
      ),
    ...(isClientModule(source.file)
      ? []
      : [`${tsxPath} must start with "use client" so Next.js server components can render it`]),
  ];
}

// Every component is interactive or keeps state, so it runs on the client; without the
// directive, importing it from a Next.js server component fails to build.
function isClientModule(file: ts.SourceFile): boolean {
  const [first] = file.statements;
  return (
    first !== undefined &&
    ts.isExpressionStatement(first) &&
    ts.isStringLiteral(first.expression) &&
    first.expression.text === "use client"
  );
}

interface Source {
  file: ts.SourceFile;
  checker: ts.TypeChecker;
}

// Compiles with the registry's own tsconfig, so the check sees what `tsc` sees.
function typeScriptSource(path: string): Source {
  const config = ts.getParsedCommandLineOfConfigFile(
    componentsTsconfig,
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
      .map((prop) => `${meta.name}.json documents "${prop}", which ${typeName} does not have`),
    ...own
      .filter((prop) => !documented.has(prop))
      .map((prop) => `${typeName} declares "${prop}", which ${meta.name}.json does not document`),
    ...[...documented.values()].flatMap((prop) => {
      const symbol = props.get(prop.name);
      if (symbol === undefined) return [];
      const required = (symbol.flags & ts.SymbolFlags.Optional) === 0;
      if (required === prop.required) return [];
      return required
        ? [`${meta.name}.json marks "${prop.name}" optional, but ${typeName} requires it`]
        : [`${meta.name}.json marks "${prop.name}" required, but ${typeName} makes it optional`];
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

// Components are copied into user projects, so they may import only what their meta declares
// (AGENTS.md: no internal imports). Dynamic import() is not checked.
function foreignImports(meta: ComponentMeta, file: ts.SourceFile): string[] {
  const allowed = (specifier: string) =>
    specifier === "react" ||
    specifier === `./${meta.name}.module.css` ||
    meta.dependencies.some((dep) => specifier === dep || specifier.startsWith(`${dep}/`)) ||
    meta.registryDependencies.some((dep) => specifier === `./${dep}`);

  return file.statements
    .flatMap((statement) =>
      (ts.isImportDeclaration(statement) || ts.isExportDeclaration(statement)) &&
      statement.moduleSpecifier !== undefined &&
      ts.isStringLiteral(statement.moduleSpecifier)
        ? [statement.moduleSpecifier.text]
        : [],
    )
    .filter((specifier) => !allowed(specifier))
    .map(
      (specifier) =>
        `imports "${specifier}", which ${meta.name}.json does not list as a dependency`,
    );
}
