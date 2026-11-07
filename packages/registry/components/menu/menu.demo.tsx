import { useState } from "react";

import { Button } from "../button";
import { Menu, MenuItem, MenuSeparator, MenuTrigger } from "./menu";
import styles from "./menu.demo.module.css";

export default function MenuDemo() {
  const [last, setLast] = useState("nothing yet");
  return (
    <div className={styles.row}>
      <MenuTrigger>
        <Button variant="secondary">Actions</Button>
        <Menu
          onAction={(key) => {
            setLast(String(key));
          }}
        >
          <MenuItem id="rename">Rename</MenuItem>
          <MenuItem id="duplicate">Duplicate</MenuItem>
          <MenuItem id="archive" isDisabled>
            Archive
          </MenuItem>
          <MenuSeparator />
          <MenuItem id="delete" variant="danger">
            Delete
          </MenuItem>
        </Menu>
      </MenuTrigger>
      <span>Last action: {last}</span>
    </div>
  );
}
