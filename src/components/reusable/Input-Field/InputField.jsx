import React from "react";
import styles from "./input-field.module.css";

const InputField = ({
  label,
  type = "text",
  layout = "column",
  className,
  ...props
}) => {
  const containerStyle =
    layout === "row" ? styles.inputContainerRow : styles.inputContainer;

  return (
    <div className={`${containerStyle} ${className || ""}`}>
      <label className={styles.label}>{label}</label>
      <input type={type} className={styles.input} {...props} />
    </div>
  );
};

export default InputField;
