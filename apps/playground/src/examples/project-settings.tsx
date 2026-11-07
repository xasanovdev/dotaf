import { Button } from "@registry/button/button";
import { Card, CardBody, CardHeader, CardTitle } from "@registry/card/card";
import { Dialog, DialogDescription, DialogFooter, DialogTitle } from "@registry/dialog/dialog";
import { Menu, MenuItem, MenuSeparator, MenuTrigger } from "@registry/menu/menu";
import {
  Select,
  SelectDescription,
  SelectItem,
  SelectLabel,
  SelectPopover,
  SelectTrigger,
} from "@registry/select/select";
import { Tab, TabList, TabPanel, Tabs } from "@registry/tabs/tabs";
import { Tooltip, TooltipTrigger } from "@registry/tooltip/tooltip";
import { useState } from "react";

import styles from "./project-settings.module.css";

const regions = [
  { id: "virginia", name: "Virginia" },
  { id: "frankfurt", name: "Frankfurt" },
  { id: "singapore", name: "Singapore" },
];

const team = [
  { id: "ada", name: "Ada Lovelace", role: "Owner" },
  { id: "grace", name: "Grace Hopper", role: "Member" },
  { id: "alan", name: "Alan Turing", role: "Member" },
];

type Member = (typeof team)[number];

export function ProjectSettings() {
  const [members, setMembers] = useState(team);
  // The menu only asks; the dialog, opened from its state, confirms.
  const [removing, setRemoving] = useState<Member>();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project settings</CardTitle>
        <div className={styles.id}>
          <code>prj_8f3k2</code>
          <TooltipTrigger>
            <Button variant="ghost" size="sm" aria-label="Copy project ID">
              <svg viewBox="0 0 16 16" className={styles.icon} aria-hidden="true">
                <rect x="5" y="5" width="8" height="8" rx="1.5" />
                <path d="M3 11V4a1 1 0 0 1 1-1h7" />
              </svg>
            </Button>
            <Tooltip>Copy project ID</Tooltip>
          </TooltipTrigger>
        </div>
      </CardHeader>
      <CardBody>
        <Tabs>
          <TabList aria-label="Project settings">
            <Tab id="general">General</Tab>
            <Tab id="members">Members</Tab>
          </TabList>
          <TabPanel id="general">
            <Select defaultValue="virginia">
              <SelectLabel>Region</SelectLabel>
              <SelectTrigger />
              <SelectDescription>Where the project's data is stored.</SelectDescription>
              <SelectPopover items={regions}>
                {(region) => <SelectItem id={region.id}>{region.name}</SelectItem>}
              </SelectPopover>
            </Select>
          </TabPanel>
          <TabPanel id="members">
            <ul aria-label="Members" className={styles.members}>
              {members.map((member) => (
                <li key={member.id} className={styles.member}>
                  <span className={styles.person}>
                    <span>{member.name}</span>
                    <span className={styles.role}>{member.role}</span>
                  </span>
                  <MenuTrigger>
                    <Button variant="ghost" size="sm" aria-label={`Actions for ${member.name}`}>
                      •••
                    </Button>
                    <Menu>
                      <MenuItem>Make owner</MenuItem>
                      <MenuSeparator />
                      <MenuItem
                        variant="danger"
                        onAction={() => {
                          setRemoving(member);
                        }}
                      >
                        Remove
                      </MenuItem>
                    </Menu>
                  </MenuTrigger>
                </li>
              ))}
            </ul>
          </TabPanel>
        </Tabs>
      </CardBody>
      <Dialog
        role="alertdialog"
        isOpen={removing !== undefined}
        onOpenChange={(isOpen) => {
          if (!isOpen) setRemoving(undefined);
        }}
      >
        <DialogTitle>Remove {removing?.name}?</DialogTitle>
        <DialogDescription>They lose access to the project right away.</DialogDescription>
        <DialogFooter>
          <Button slot="close" variant="secondary">
            Cancel
          </Button>
          <Button
            slot="close"
            variant="danger"
            onPress={() => {
              setMembers((current) => current.filter((member) => member !== removing));
            }}
          >
            Remove
          </Button>
        </DialogFooter>
      </Dialog>
    </Card>
  );
}
