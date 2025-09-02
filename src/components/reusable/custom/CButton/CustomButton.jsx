import React from "react";
import styles from "./custom-button.module.css";

// const CustomButton = ({
//   icon,
//   buttonText,
//   buttonSize,
//   type,
//   onClick,
//   disabled = false,
//   borderRadius = "var(--border-radius-sm)",
//   bgColor = "var(--color-primary-light)",
//   textColor = "var(--color-white)",
//   ...props
// }) => {
//   return (
//     <button
//       disabled={disabled}
//       type={type}
//       onClick={onClick}
//       className={`${disabled && styles["disabled"]} ${styles.customButton} ${
//         styles[buttonSize]
//       }`}
//       style={{
//         borderRadius,
//         backgroundColor: bgColor,
//         color: textColor,
//         ...props.style,
//       }}
//     >
//       {icon && icon}
//       {buttonText}
//     </button>
//   );
// };

// export default CustomButton;

const CustomButton = ({
  icon,
  buttonText,
  buttonSize,
  type,
  onClick,
  disabled = false,
  borderRadius = "var(--border-radius-sm)",
  bgColor = "var(--color-primary-light)",
  textColor = "var(--color-white)",
  ...props
}) => {
  return (
    <div
      className={` 
                ${disabled && styles["disabled"]} 
                ${styles.customButton} ${styles[buttonSize]}`}
      style={{
        borderRadius: borderRadius,
        backgroundColor: bgColor,
        color: textColor,
        ...props.style,
      }}
    >
      <button
        disabled={disabled}
        type={type}
        onClick={onClick}
        className={styles.btn}
        style={{ borderRadius: borderRadius, color: textColor }}
      >
        {/* Conditionally render the icon if provided */}
        {icon && icon}
        {buttonText}
      </button>
    </div>
  );
};

export default CustomButton;
