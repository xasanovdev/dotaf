import "virtual:dotaf.css";
import "./global.css";

import { useEffect, useState } from "react";
import { Label, RadioButton, RadioField, RadioGroup } from "react-aria-components";

import styles from "./app.module.css";
import { demos } from "./demos.js";

const themes = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
] as const;

type Theme = (typeof themes)[number]["value"];

export function App() {
  const [theme, setTheme] = useState<Theme>("system");

  // dotaf.css themes from <html data-theme>; "system" leaves it to prefers-color-scheme.
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") delete root.dataset.theme;
    else root.dataset.theme = theme;
  }, [theme]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>dotaf playground</h1>
        <RadioGroup
          className={styles.themes}
          orientation="horizontal"
          value={theme}
          onChange={(value) => {
            const next = themes.find((option) => option.value === value);
            if (next !== undefined) setTheme(next.value);
          }}
        >
          <Label className={styles.themesLabel}>Theme</Label>
          {themes.map(({ value, label }) => (
            <RadioField key={value} value={value}>
              <RadioButton className={styles.theme}>{label}</RadioButton>
            </RadioField>
          ))}
        </RadioGroup>
      </header>
      <main className={styles.demos}>
        {demos.length === 0 ? (
          <p>The registry has no components yet.</p>
        ) : (
          demos.map(({ name, Demo }) => (
            <section key={name} aria-labelledby={`demo-${name}`}>
              <h2 id={`demo-${name}`} className={styles.demoTitle}>
                {name}
              </h2>
              <Demo />
            </section>
          ))
        )}
      </main>
    </div>
  );
}
