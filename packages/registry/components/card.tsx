"use client";

import { createContext, use, useEffect, useId, useState, type ComponentPropsWithRef } from "react";
import styles from "./card.module.css";

// Card is plain HTML: React Aria has no card primitive, and a static container has no
// interaction to borrow. CardTitle tells the card its id, which then names the <article>
// for assistive technology; a card without a title stays unnamed rather than pointing at
// an id that doesn't exist. Parts are separate exports so server components can use them.
const SetTitleIdContext = createContext<(id: string | undefined) => void>(() => undefined);

/** Everything an <article> takes; Card adds no props of its own. */
export type CardProps = Omit<ComponentPropsWithRef<"article">, "className" | "style">;

export function Card(props: CardProps) {
  const [titleId, setTitleId] = useState<string>();
  return (
    <SetTitleIdContext value={setTitleId}>
      <article aria-labelledby={titleId} {...props} className={styles.root} />
    </SetTitleIdContext>
  );
}

export type CardHeaderProps = Omit<ComponentPropsWithRef<"header">, "className" | "style">;

export function CardHeader(props: CardHeaderProps) {
  return <header {...props} className={styles.header} />;
}

export interface CardTitleProps extends Omit<ComponentPropsWithRef<"h3">, "className" | "style"> {
  /** Heading level in the page outline. */
  level?: 2 | 3 | 4 | 5 | 6;
}

export function CardTitle({ level = 3, id, ...props }: CardTitleProps) {
  const generatedId = useId();
  const titleId = id ?? generatedId;
  const setTitleId = use(SetTitleIdContext);
  useEffect(() => {
    setTitleId(titleId);
    return () => {
      setTitleId(undefined);
    };
  }, [setTitleId, titleId]);

  const Heading = `h${String(level)}` as "h2" | "h3" | "h4" | "h5" | "h6";
  return <Heading {...props} id={titleId} className={styles.title} />;
}

export type CardBodyProps = Omit<ComponentPropsWithRef<"div">, "className" | "style">;

export function CardBody(props: CardBodyProps) {
  return <div {...props} className={styles.body} />;
}

export type CardFooterProps = Omit<ComponentPropsWithRef<"footer">, "className" | "style">;

export function CardFooter(props: CardFooterProps) {
  return <footer {...props} className={styles.footer} />;
}
