# Components

Components sit side by side, exactly as `dotaf add` copies them into a project:

```
button.json        meta: name, description, dependencies, registryDependencies, props, example
button.tsx         built on react-aria-components; exports Button and ButtonProps
button.module.css  every design value is a var(--dotaf-*) token
```

A component that uses another imports it as `./button` and lists `button` in `registryDependencies`; that import resolves the same here, in the playground and in a user's project, and `dotaf add` copies both.

The meta is what agents read before picking a component, so describe what it is for, not how it is built. A component missing any of the three files is an error, not a skipped entry. The registry tests check that each component agrees with itself:

- every prop `ButtonProps` declares itself is in the meta with the same `required`, and every documented prop exists on it (inherited React Aria props may be documented too);
- every `styles.x` the component uses has a `.x` rule in its CSS module;
- it imports only `react`, its own CSS module, its `dependencies` and its `registryDependencies` (as `./<name>`), each of which exists here.
