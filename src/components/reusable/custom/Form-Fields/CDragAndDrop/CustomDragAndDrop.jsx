import React, { useState, useCallback } from "react";
import styles from "./custom-drag-drop.module.css";
import { FiUpload } from "react-icons/fi";
import { useTranslation } from "react-i18next";

export function FileUpload({ onFilesChange, accept }) {
  const { t } = useTranslation("common");
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);

      const droppedFiles = Array.from(e.dataTransfer.files);
      if (droppedFiles.length > 0 && onFilesChange) {
        onFilesChange(droppedFiles);
      }
    },
    [onFilesChange],
  );

  const handleFileInput = useCallback(
    (e) => {
      const selectedFiles = Array.from(e.target.files);
      if (selectedFiles.length > 0 && onFilesChange) {
        onFilesChange(selectedFiles);
      }
    },
    [onFilesChange],
  );

  return (
    <div>
      <div
        className={`${styles.uploadZone} ${isDragging ? styles.dragging : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          className={styles.fileInput}
          onChange={handleFileInput}
          accept={accept}
          multiple
        />

        <div className={styles.uploadPrompt}>
          <FiUpload className={styles.uploadIcon} />
          {/* <div className={styles.uploadIcon}>↑</div> */}
          <p>{t("uploadFiles.heading")}</p>
          <p className={styles.uploadSubtitle}>
            {t("uploadFiles.selectFromDevice")}
          </p>
          <p className={styles.uploadSubtitle}>
            {t("uploadFiles.recommendedFormatText")} {accept}
          </p>
        </div>
      </div>
    </div>
  );
}
