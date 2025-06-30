import React from "react";
import styles from "./custom-download-btn.module.css";

const CustomDownloadButton = ({ label, icon, buttonText, downloadLink }) => {
  return (
    <div className={styles.customFileInput}>
      <label htmlFor={name}>
        <label>{label}</label>
      </label>
      <div className={styles.inputWrapper}>
        {downloadLink ? (
          <a href={downloadLink} target="_blank" rel="noopener noreferrer">
            {icon}
            <span>{buttonText}</span>
          </a>
        ) : (
          <p>No file available</p>
        )}
      </div>
    </div>
  );
};

export default CustomDownloadButton;
