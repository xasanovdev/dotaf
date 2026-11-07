import {
  Combobox,
  ComboboxDescription,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxPopover,
} from "./combobox";
import styles from "./combobox.demo.module.css";

const timezones = [
  "Africa/Cairo",
  "America/New_York",
  "America/Sao_Paulo",
  "Asia/Tashkent",
  "Asia/Tokyo",
  "Australia/Sydney",
  "Europe/Berlin",
  "Europe/London",
  "Pacific/Auckland",
];

export default function ComboboxDemo() {
  return (
    <div className={styles.grid}>
      <Combobox>
        <ComboboxLabel>Country</ComboboxLabel>
        <ComboboxInput placeholder="Type to search" />
        <ComboboxPopover>
          <ComboboxItem id="de">Germany</ComboboxItem>
          <ComboboxItem id="jp">Japan</ComboboxItem>
          <ComboboxItem id="kz">Kazakhstan</ComboboxItem>
          <ComboboxItem id="kg">Kyrgyzstan</ComboboxItem>
          <ComboboxItem id="uz">Uzbekistan</ComboboxItem>
          <ComboboxItem id="us">United States</ComboboxItem>
        </ComboboxPopover>
      </Combobox>
      <Combobox defaultValue="Asia/Tashkent">
        <ComboboxLabel>Timezone</ComboboxLabel>
        <ComboboxInput />
        <ComboboxDescription>Reminders are sent in this timezone.</ComboboxDescription>
        <ComboboxPopover>
          {timezones.map((zone) => (
            <ComboboxItem key={zone} id={zone}>
              {zone.replace("_", " ")}
            </ComboboxItem>
          ))}
        </ComboboxPopover>
      </Combobox>
    </div>
  );
}
