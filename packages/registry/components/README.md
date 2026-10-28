# Components

Each component is one folder, copied into user projects as source:

```
button/
  meta.json          name, description, dependencies, props, example
  button.tsx         built on react-aria-components; exports Button and ButtonProps
  button.module.css  every design value is a var(--dotaf-*) token
```

`meta.json` is what agents read before picking a component, so describe what it is for, not how it is built. A folder missing any of the three files is an error, not a skipped entry. The registry tests check that each folder agrees with itself:

- every prop `ButtonProps` declares itself is in `meta.json` with the same `required`, and every documented prop exists on it (inherited React Aria props may be documented too);
- every `styles.x` the component uses has a `.x` rule in its CSS module;
- it imports only `react`, its own CSS module and its `dependencies`.
