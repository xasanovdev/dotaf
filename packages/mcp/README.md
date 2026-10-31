# @dotaf/mcp

MCP server that gives coding agents the project's design system: tokens, components, theme updates and UI lint.

Connect it from the project root:

```sh
claude mcp add dotaf -- npx dotaf mcp
```

Tools:

- `get_design_system`: the rules UI code follows and every token with its purpose and light and dark values.
- `list_components`: the dotaf components, what each is for, and which the project already has.
- `get_component`: a component's props, example and npm packages, with its source when the project doesn't have it yet.
- `add_component`: copies components into the project, never over a file that exists.
- `update_theme`: changes brand values in `dotaf.json` and regenerates `dotaf.css` at once.
- `lint_ui`: reports raw design values in the project's CSS as `file:line:column` with the token to use.

Every tool takes an optional `path`: the folder or file the agent is working in. In a monorepo, it picks the right `dotaf.json`.
