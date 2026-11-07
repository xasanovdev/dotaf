# Components

Each component has its own folder, and everything about it lives there:

```
button/
  button.json               meta: name, description, dependencies, registryDependencies, props, example
  button.tsx                built on react-aria-components; exports Button and ButtonProps
  index.ts                  export * from "./button"; so projects import the folder
  button.module.css         every design value is a var(--dotaf-*) token
  button.demo.tsx           default export, shown in the playground
  button.demo.module.css    layout for the demo only
  button.browser.test.tsx   behaviour, focus and contrast in a real browser
```

The demo's layout CSS is repeated per folder on purpose, so a folder stands on its own.

`dotaf add` copies `button.tsx`, `button.module.css` and `index.ts` into the project's `paths.components/button/`, the same folder shape as here. The project imports the folder, `@/components/ui/button`, and `index.ts` hands it everything `button.tsx` exports. The demo and tests stay in the registry and are left out of the npm package.

A component that uses another imports it as `../button` and lists `button` in `registryDependencies`; that import resolves the same here, in the playground and in a user's project, and `dotaf add` copies both.

The meta is what agents read before picking a component, so describe what it is for, not how it is built. A folder missing the meta or a source file is an error, not a skipped entry. The registry tests check that each component agrees with itself:

- every prop `ButtonProps` declares itself is in the meta with the same `required`, and every documented prop exists on it (inherited React Aria props may be documented too);
- every `styles.x` the component uses has a `.x` rule in its CSS module;
- it imports only `react`, its own CSS module, its `dependencies` and its `registryDependencies` (as `../<name>`), each of which exists here;
- its `index.ts` is exactly `export * from "./<name>";`.

The playground runs the browser tests (`pnpm --filter @dotaf/playground test`), since they need its generated `dotaf.css`, and picks up every `*.demo.tsx` without a list to keep.
