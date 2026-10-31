import { Button } from "@registry/button";
import { Card, CardBody, CardFooter, CardHeader, CardTitle } from "@registry/card";
import { Switch } from "@registry/switch";
import { useState } from "react";

import styles from "./notification-settings.module.css";

export function NotificationSettings() {
  const [saved, setSaved] = useState(false);
  // "Saved" describes the values on screen, so any change makes it stale.
  const clearSaved = () => {
    setSaved(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification settings</CardTitle>
        Choose how we reach you.
      </CardHeader>
      <CardBody>
        <div className={styles.switches}>
          <Switch defaultSelected onChange={clearSaved}>
            Email notifications
          </Switch>
          <Switch onChange={clearSaved}>Push notifications</Switch>
        </div>
      </CardBody>
      <CardFooter>
        {/* Rendered while empty, so screen readers already watch it when "Saved" appears. */}
        <span role="status" className={styles.status}>
          {saved ? "Saved" : ""}
        </span>
        <Button
          onPress={() => {
            setSaved(true);
          }}
        >
          Save
        </Button>
      </CardFooter>
    </Card>
  );
}
