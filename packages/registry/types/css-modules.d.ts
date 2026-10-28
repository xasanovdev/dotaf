// Bundlers (Vite, Next.js) give user projects this declaration; the registry needs its own
// to typecheck components. A class a component uses but its CSS lacks is caught by the
// registry tests, not by this type.
declare module "*.module.css" {
  const classes: Readonly<Record<string, string>>;
  export default classes;
}
