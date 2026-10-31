# Components

Each component has its own folder, and everything about it lives there:

```
button/
  button.json               meta: name, description, dependencies, registryDependencies, props, example
  button.tsx                built on react-aria-components; exports Button and ButtonProps
  button.module.css         every design value is a var(--dotaf-*) token
  button.demo.tsx           default export, shown in the playground
  button.demo.module.css    layout for the demo only
  button.browser.test.tsx   behaviour, focus and contrast in a real browser
```

The demo's layout CSS is repeated per folder on purpose, so a folder stands on its own.

`dotaf add` copies `button.tsx` and `button.module.css` into the project's `paths.components/button/`, the same folder shape as here. The demo and tests stay in the registry and are left out of the npm package.

A component that uses another imports it as `../button/button` and lists `button` in `registryDependencies`; that import resolves the same here, in the playground and in a user's project, and `dotaf add` copies both.

The meta is what agents read before picking a component, so describe what it is for, not how it is built. A folder missing the meta or a source file is an error, not a skipped entry. The registry tests check that each component agrees with itself:

- every prop `ButtonProps` declares itself is in the meta with the same `required`, and every documented prop exists on it (inherited React Aria props may be documented too);
- every `styles.x` the component uses has a `.x` rule in its CSS module;
- it imports only `react`, its own CSS module, its `dependencies` and its `registryDependencies` (as `../<name>/<name>`), each of which exists here.

The playground runs the browser tests (`pnpm --filter @dotaf/playground test`), since they need its generated `dotaf.css`, and picks up every `*.demo.tsx` without a list to keep.
