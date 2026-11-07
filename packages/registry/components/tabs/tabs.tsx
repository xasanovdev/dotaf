"use client";

import type { Ref } from "react";
import {
  Tab as AriaTab,
  TabList as AriaTabList,
  TabPanel as AriaTabPanel,
  Tabs as AriaTabs,
  type TabListProps as AriaTabListProps,
  type TabPanelProps as AriaTabPanelProps,
  type TabProps as AriaTabProps,
  type TabsProps as AriaTabsProps,
} from "react-aria-components";

import styles from "./tabs.module.css";

// React Aria pairs each Tab with the TabPanel of the same id. The parts keep React Aria's
// names and are separate exports so server components can use them.

export interface TabsProps extends Omit<AriaTabsProps, "className" | "style"> {
  ref?: Ref<HTMLDivElement>;
}

export function Tabs(props: TabsProps) {
  return <AriaTabs {...props} className={styles.root} />;
}

export type TabListProps<T extends object = object> = Omit<
  AriaTabListProps<T>,
  "className" | "style"
>;

export function TabList<T extends object>(props: TabListProps<T>) {
  return <AriaTabList {...props} className={styles.list} />;
}

export type TabProps = Omit<AriaTabProps, "className" | "style">;

export function Tab(props: TabProps) {
  return <AriaTab {...props} className={styles.tab} />;
}

export type TabPanelProps = Omit<AriaTabPanelProps, "className" | "style">;

export function TabPanel(props: TabPanelProps) {
  return <AriaTabPanel {...props} className={styles.panel} />;
}
