import React from "react";
import styles from "./custom-button.module.css";
import { IoAddOutline } from "react-icons/io5";

const CustomBtn = ({
  label,
  onClick,
  type = "button",
  className = "",
  showIcon = false,
  icon: Icon = IoAddOutline,
  iconSize = 24,
  position = "right",
}) => {
  const positionStyles = {
    left: "flex-start",
    middle: "center",
    right: "flex-end",
  };

  return (
    <div style={{ display: "flex", justifyContent: positionStyles[position] }}>
      <button
        className={`${styles.button} ${className}`}
        onClick={onClick}
        type={type}
      >
        {showIcon && Icon && <Icon className={styles.icon} />}
        <span className={styles.label}>{label}</span>
      </button>
    </div>
  );
};

export default CustomBtn;
