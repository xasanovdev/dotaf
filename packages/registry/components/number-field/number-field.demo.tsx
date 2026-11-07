import {
  NumberField,
  NumberFieldDescription,
  NumberFieldError,
  NumberFieldInput,
  NumberFieldLabel,
} from "./number-field";
import styles from "./number-field.demo.module.css";

export default function NumberFieldDemo() {
  return (
    <div className={styles.grid}>
      <NumberField defaultValue={1} minValue={1} maxValue={10}>
        <NumberFieldLabel>Quantity</NumberFieldLabel>
        <NumberFieldInput />
        <NumberFieldDescription>Up to 10 per order.</NumberFieldDescription>
      </NumberField>
      <NumberField
        defaultValue={49}
        minValue={0}
        step={0.5}
        formatOptions={{ style: "currency", currency: "USD" }}
      >
        <NumberFieldLabel>Price</NumberFieldLabel>
        <NumberFieldInput />
      </NumberField>
      <NumberField
        validationBehavior="aria"
        defaultValue={0.8}
        step={0.05}
        formatOptions={{ style: "percent" }}
        validate={(value) => (value > 0.5 ? "A discount over 50% needs approval" : null)}
      >
        <NumberFieldLabel>Discount</NumberFieldLabel>
        <NumberFieldInput />
        <NumberFieldError />
      </NumberField>
    </div>
  );
}
