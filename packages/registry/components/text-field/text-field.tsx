"use client";

import { useState, type Ref } from "react";
import {
  TextField as AriaTextField,
  FieldError,
  Group,
  Input,
  Label,
  Text,
  ToggleButton,
  type TextFieldProps as AriaTextFieldProps,
  type FieldErrorProps,
  type InputProps,
  type LabelProps,
  type TextProps,
} from "react-aria-components";

import styles from "./text-field.module.css";

// React Aria wires the parts together (label, described-by, invalid state) through context.
// They are separate exports so server components can use them.

export interface TextFieldProps extends Omit<AriaTextFieldProps, "className" | "style"> {
  ref?: Ref<HTMLDivElement>;
}

export function TextField(props: TextFieldProps) {
  return <AriaTextField {...props} className={styles.root} />;
}

export type TextFieldLabelProps = Omit<LabelProps, "className" | "style">;

export function TextFieldLabel(props: TextFieldLabelProps) {
  return <Label {...props} className={styles.label} />;
}

export type TextFieldInputProps = Omit<InputProps, "className" | "style">;

export function TextFieldInput(props: TextFieldInputProps) {
  return <Input {...props} className={styles.input} />;
}

export type TextFieldPasswordInputProps = Omit<InputProps, "className" | "style" | "type">;

/** A password input with a button inside its box that shows or hides the password. */
export function TextFieldPasswordInput(props: TextFieldPasswordInputProps) {
  const [isShown, setShown] = useState(false);

  return (
    <Group className={styles.passwordBox}>
      <Input
        {...props}
        type={isShown ? "text" : "password"}
        // Spellcheck services can send the text of a visible field to a server.
        {...(isShown ? { spellCheck: false, autoCapitalize: "off", autoCorrect: "off" } : {})}
        className={styles.passwordInput}
      />
      {/* The name stays "Show password"; aria-pressed tells whether it is shown. */}
      <ToggleButton
        isSelected={isShown}
        onChange={setShown}
        aria-label="Show password"
        className={styles.reveal}
      >
        <svg viewBox="0 0 16 16" className={styles.eye} aria-hidden="true">
          <path d="M1.5 8s2.5-4.5 6.5-4.5S14.5 8 14.5 8s-2.5 4.5-6.5 4.5S1.5 8 1.5 8z" />
          <circle cx="8" cy="8" r="2" />
          {isShown ? <path d="M2.5 2.5l11 11" /> : null}
        </svg>
      </ToggleButton>
    </Group>
  );
}

export type TextFieldDescriptionProps = Omit<TextProps, "className" | "style" | "slot">;

export function TextFieldDescription(props: TextFieldDescriptionProps) {
  return <Text {...props} slot="description" className={styles.description} />;
}

export type TextFieldErrorProps = Omit<FieldErrorProps, "className" | "style">;

/** Shows the validation message while the field is invalid; renders nothing otherwise. */
export function TextFieldError(props: TextFieldErrorProps) {
  // A live region announces only changes inside it, so it stays mounted while the
  // message comes and goes.
  return (
    <div aria-live="polite" className={styles.errorRegion}>
      <FieldError {...props} className={styles.error} />
    </div>
  );
}
