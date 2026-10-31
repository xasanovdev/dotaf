# @dotaf/core

Engine of dotaf: dotaf.json schema, CSS token generation, config loading, component install and lint runs. The CLI and the MCP server are thin wrappers over it.

## Layout

```
src/
  index.ts     the public API
  commands/    init, add, theme, lint, design-system: what the CLI and MCP server call
  project/     finds the project, reads and writes dotaf.json, dotaf.css and package.json
  config/      pure: dotaf.json schema, parsing, CSS token generation, JSON helpers
```

Imports point down only: `commands/` → `project/` → `config/`. ESLint checks the static imports (see AGENTS.md).
