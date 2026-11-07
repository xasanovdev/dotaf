# dotaf

Design system for coding agents. A project's brand lives in `dotaf.json`; dotaf turns it into CSS tokens (`--dotaf-*`) and React Aria components styled with CSS Modules, and serves both to agents over MCP.

## Package boundaries

- `core` owns behaviour. `cli` and `mcp` are adapters: parse input, call `core`, format output. New logic lands in `core` so both adapters get it.
- Dependencies point one way: `cli` → `mcp` → `core` → `registry`, `stylelint-config`.
- Inside `core/src` the same holds across three layers: `commands/` (what `cli` and `mcp` call; they may touch the disk) → `project/` (finds the project, reads and writes `dotaf.json`, `dotaf.css` and `package.json`) → `config/` (pure: schema, parsing, CSS generation, JSON helpers; no disk). ESLint checks the static imports.

## Components

- Every design value in CSS (color, spacing, radius, font, shadow) is a token: `var(--dotaf-*)`. The `dotaf/use-tokens` stylelint rule enforces it.
- Before writing or changing a component, read `packages/registry/components/AGENTS.md`: the component rules, and the shadcn and Tailwind habits that break them.

## Quality gate

A change is ready for review when all of these hold:

1. **Design.** Package interfaces follow the `codebase-design` skill; component APIs follow `vercel-composition-patterns`.
2. **Build.** Logic in `core`, `cli`, `mcp`, `stylelint-config` is written test-first (`tdd` skill): each behaviour has a test that went red before it went green. React code follows `vercel-react-best-practices`; UI follows `web-design-guidelines`.
3. **Checks.** `pnpm check` passes (format, lint, typecheck, test, build).

Skills are used when installed; the checks in step 3 apply to everyone.

## Gotchas

- TypeScript is pinned to `~6.0`: `typescript-eslint` supports `<6.1`.
- ESLint is pinned to `^9`: `eslint-plugin-jsx-a11y` supports up to ESLint 9.
- `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` are on: indexed reads can be `undefined`, and optional props take `undefined` only when typed `| undefined`.
- The Claude Code git guardrail (`.claude/hooks/block-dangerous-git.sh`) reads input with `jq`. Install `jq`; on a machine without it the hook lets every command through.
