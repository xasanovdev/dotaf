import {
  Select,
  SelectDescription,
  SelectError,
  SelectItem,
  SelectLabel,
  SelectPopover,
  SelectTrigger,
} from "./select";
import styles from "./select.demo.module.css";

const timezones = [
  { id: "tashkent", name: "Tashkent (UTC+5)" },
  { id: "london", name: "London (UTC+0)" },
  { id: "new-york", name: "New York (UTC−5)" },
  { id: "tokyo", name: "Tokyo (UTC+9)" },
];

export default function SelectDemo() {
  return (
    <div className={styles.grid}>
      <Select placeholder="Pick a timezone">
        <SelectLabel>Timezone</SelectLabel>
        <SelectTrigger />
        <SelectDescription>Reminders follow this clock.</SelectDescription>
        <SelectPopover items={timezones}>
          {(zone) => <SelectItem id={zone.id}>{zone.name}</SelectItem>}
        </SelectPopover>
      </Select>
      <Select isInvalid defaultValue={null}>
        <SelectLabel>Plan</SelectLabel>
        <SelectTrigger />
        <SelectError>Choose a plan to continue.</SelectError>
        <SelectPopover>
          <SelectItem id="free">Free</SelectItem>
          <SelectItem id="pro">Pro</SelectItem>
          <SelectItem id="team" isDisabled>
            Team (soon)
          </SelectItem>
        </SelectPopover>
      </Select>
      <Select isDisabled defaultValue="en">
        <SelectLabel>Language</SelectLabel>
        <SelectTrigger />
        <SelectPopover>
          <SelectItem id="en">English</SelectItem>
        </SelectPopover>
      </Select>
    </div>
  );
}
