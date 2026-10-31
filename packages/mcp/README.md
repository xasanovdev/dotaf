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
