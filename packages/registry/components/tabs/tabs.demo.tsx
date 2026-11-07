import { Tab, TabList, TabPanel, Tabs } from "./tabs";
import styles from "./tabs.demo.module.css";

export default function TabsDemo() {
  return (
    <div className={styles.stack}>
      <Tabs>
        <TabList aria-label="Project">
          <Tab id="overview">Overview</Tab>
          <Tab id="activity">Activity</Tab>
          <Tab id="settings">Settings</Tab>
          <Tab id="usage" isDisabled>
            Usage
          </Tab>
        </TabList>
        <TabPanel id="overview">Everything about the project at a glance.</TabPanel>
        <TabPanel id="activity">Recent changes by the team.</TabPanel>
        <TabPanel id="settings">Name, visibility and danger zone.</TabPanel>
        <TabPanel id="usage">Usage reports.</TabPanel>
      </Tabs>
      <Tabs orientation="vertical">
        <TabList aria-label="Account">
          <Tab id="profile">Profile</Tab>
          <Tab id="security">Security</Tab>
          <Tab id="notifications">Notifications</Tab>
        </TabList>
        <TabPanel id="profile">Your name and photo.</TabPanel>
        <TabPanel id="security">Password and two-factor sign-in.</TabPanel>
        <TabPanel id="notifications">What we email you about.</TabPanel>
      </Tabs>
    </div>
  );
}
