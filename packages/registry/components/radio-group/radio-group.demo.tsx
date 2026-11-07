import {
  Radio,
  RadioGroup,
  RadioGroupDescription,
  RadioGroupError,
  RadioGroupLabel,
} from "./radio-group";
import styles from "./radio-group.demo.module.css";

export default function RadioGroupDemo() {
  return (
    <div className={styles.grid}>
      <RadioGroup defaultValue="pro">
        <RadioGroupLabel>Plan</RadioGroupLabel>
        <Radio value="free">Free</Radio>
        <Radio value="pro">Pro</Radio>
        <Radio value="team">Team</Radio>
        <RadioGroupDescription>You can change it later.</RadioGroupDescription>
      </RadioGroup>
      <RadioGroup orientation="horizontal" defaultValue="monthly">
        <RadioGroupLabel>Billing</RadioGroupLabel>
        <Radio value="monthly">Monthly</Radio>
        <Radio value="yearly">Yearly</Radio>
      </RadioGroup>
      <RadioGroup
        validationBehavior="aria"
        defaultValue="email"
        validate={(value) => (value === "email" ? "Email is down; pick another channel" : null)}
      >
        <RadioGroupLabel>Contact by</RadioGroupLabel>
        <Radio value="email">Email</Radio>
        <Radio value="sms">SMS</Radio>
        <Radio value="none" isDisabled>
          Post (unavailable)
        </Radio>
        <RadioGroupError />
      </RadioGroup>
    </div>
  );
}
