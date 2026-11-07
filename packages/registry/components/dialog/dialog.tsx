"use client";

import type { ComponentPropsWithRef, Ref } from "react";
import {
  Button as AriaButton,
  Dialog as AriaDialog,
  Heading,
  Modal,
  ModalOverlay,
  Text,
  type ButtonProps as AriaButtonProps,
  type DialogProps as AriaDialogProps,
  type HeadingProps,
  type TextProps,
} from "react-aria-components";

import styles from "./dialog.module.css";

// React Aria wires the parts through slots: DialogTitle names the dialog, DialogDescription
// describes it, and any button with slot="close" closes it. Parts are separate exports so
// server components can use them.

export { DialogTrigger, type DialogTriggerProps } from "react-aria-components";

export interface DialogProps extends Omit<AriaDialogProps, "className" | "style"> {
  /** Close on a click outside. Leave off for dialogs that ask for a decision. */
  isDismissable?: boolean;
  /** Controlled open state, for a dialog opened without a DialogTrigger. */
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  ref?: Ref<HTMLElement>;
}

export function Dialog({ isDismissable = false, isOpen, onOpenChange, ...props }: DialogProps) {
  return (
    <ModalOverlay
      className={styles.overlay}
      isDismissable={isDismissable}
      {...(isOpen === undefined ? {} : { isOpen })}
      {...(onOpenChange === undefined ? {} : { onOpenChange })}
    >
      <Modal className={styles.modal}>
        <AriaDialog {...props} className={styles.root} />
      </Modal>
    </ModalOverlay>
  );
}

export interface DialogCloseProps extends Omit<
  AriaButtonProps,
  "className" | "style" | "slot" | "children"
> {
  /** The button's name for screen readers; translate it with the rest of the UI. */
  "aria-label"?: string | undefined;
  ref?: Ref<HTMLButtonElement>;
}

/**
 * An X in the top-right corner. Opt-in: give it to dialogs that inform or collect input.
 * Leave it out of an alertdialog, where Cancel is the way out and an X would be a third choice.
 */
export function DialogClose({ "aria-label": label = "Close", ...props }: DialogCloseProps) {
  return (
    <AriaButton {...props} slot="close" aria-label={label} className={styles.close}>
      <svg viewBox="0 0 16 16" className={styles.icon} aria-hidden="true">
        <path d="M4 4l8 8M12 4l-8 8" />
      </svg>
    </AriaButton>
  );
}

export type DialogTitleProps = Omit<HeadingProps, "className" | "style" | "slot">;

export function DialogTitle(props: DialogTitleProps) {
  return <Heading {...props} slot="title" className={styles.title} />;
}

export type DialogDescriptionProps = Omit<TextProps, "className" | "style" | "slot">;

export function DialogDescription(props: DialogDescriptionProps) {
  return <Text elementType="p" {...props} slot="description" className={styles.description} />;
}

export type DialogFooterProps = Omit<ComponentPropsWithRef<"footer">, "className" | "style">;

/** The dialog's actions, right-aligned; the primary action goes last. */
export function DialogFooter(props: DialogFooterProps) {
  return <footer {...props} className={styles.footer} />;
}
