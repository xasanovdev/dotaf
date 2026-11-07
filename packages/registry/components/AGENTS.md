# Registry components

Users copy these components into their projects as source. Write code they are glad to own: readable, small, no internal imports. [README.md](README.md) covers the folder layout and what the registry tests check.

## Habits that break here

Code from shadcn, Tailwind and Radix looks right here but breaks the rules. Write the left column:

| Write                                                                              | Instead of                                  |
| ---------------------------------------------------------------------------------- | ------------------------------------------- |
| A token: `var(--dotaf-space-4)`, `var(--dotaf-color-primary)`                      | `16px`, `#3b82f6`, a Tailwind class         |
| A CSS Module class: `className={styles.root}`                                      | `cn()`, `clsx`, inline `style`              |
| Props typed `Omit<…Props, "className" \| "style">`; variants are the styling API   | A `className` prop merged onto the root     |
| `variant="danger"` set as `data-variant`, styled by `.root[data-variant="danger"]` | Boolean props such as `danger` or `outline` |
| `[data-hovered]`, `[data-pressed]`, `[data-focus-visible]` from React Aria         | `:hover`, `:active`, `:focus-visible`       |
| A `react-aria-components` primitive                                                | A bare `<button>`, Radix, Headless UI       |
| `ref` as a regular prop (React 19)                                                 | `forwardRef`                                |
| One named export per part: `DialogTrigger`, `DialogContent`                        | `Dialog.Trigger`                            |
| Another component imported as `../button/button`                                   | `@dotaf/registry`, `@/components/...`       |

## Rules

- Every component file starts with `"use client"`.
- Build every component on `react-aria-components`, including simple ones. The one exception is a static container with no interaction to borrow (Card): plain HTML, with the reason in a comment at the top of the component.
- Larger components are compound, with each part its own named export: Next.js server components can't reach properties of a client component, so `Dialog.Trigger` fails there.
