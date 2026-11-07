import {
  TextArea,
  TextAreaDescription,
  TextAreaError,
  TextAreaInput,
  TextAreaLabel,
} from "./text-area";
import styles from "./text-area.demo.module.css";

export default function TextAreaDemo() {
  return (
    <div className={styles.grid}>
      <TextArea>
        <TextAreaLabel>Bio</TextAreaLabel>
        <TextAreaInput placeholder="A line or two about you" />
        <TextAreaDescription>Shown on your profile.</TextAreaDescription>
      </TextArea>
      <TextArea
        validationBehavior="aria"
        defaultValue="This note runs past the limit set for it."
        validate={(value) => (value.length > 30 ? "Keep it under 30 characters" : null)}
      >
        <TextAreaLabel>Note</TextAreaLabel>
        <TextAreaInput />
        <TextAreaError />
      </TextArea>
      <TextArea isDisabled defaultValue="Read only for now">
        <TextAreaLabel>Disabled</TextAreaLabel>
        <TextAreaInput />
      </TextArea>
    </div>
  );
}
