import React from "react";
import styles from "./custom-button.module.css";

const CustomButton = ({
  icon,
  buttonText,
  buttonSize,
  type = "button",
  onClick,
  disabled = false,
  borderRadius = "var(--border-radius-sm)",
  bgColor = "var(--color-primary-light)",
  textColor = "var(--color-white)",
  ...props
}) => {
  return (
    <button
      disabled={disabled}
      type={type}
      onClick={onClick}
      className={`${styles.customButton} ${styles[buttonSize]} ${
        disabled ? styles.disabled : ""
      }`}
      style={{
        borderRadius,
        backgroundColor: bgColor,
        color: textColor,
        ...props.style,
      }}
    >
      {icon && icon}
      {buttonText}
    </button>
  );
};

export default CustomButton;
