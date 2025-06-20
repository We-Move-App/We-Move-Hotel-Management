import React, { useState, useEffect } from "react";
import styles from "./upload-file.module.css";
import images from "../../../assets/image";
import SnackbarNotification from "../Snackbar-Notification/SnackbarNotification";

const UploadFile = ({
  label,
  id,
  onChange,
  className = "",
  wrapperClassName = "",
  textMode = "upload",
  fileName: propFileName = "",
  url: propFileUrl = "",
  required = false,
}) => {
  const [fileName, setFileName] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "error",
  });

  useEffect(() => {
    if (textMode === "view" && propFileUrl) {
      setFileName(propFileName);
      setFileUrl(propFileUrl);
    }
  }, [textMode, propFileName, propFileUrl]);

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > 1) {
        setSnackbar({
          open: true,
          message: "File size should be less than 1 MB",
          severity: "error",
        });
        e.target.value = ""; // Reset file input
        return;
      }

      setFileName(file.name);
      const url = URL.createObjectURL(file);
      setFileUrl(url);
      onChange(e);
    }
  };

  const handleClick = () => {
    if (textMode === "view" && fileUrl) {
      window.open(fileUrl, "_blank");
    } else {
      document.getElementById(id).click();
    }
  };

  const getDisplayText = () => {
    if (textMode === "view") {
      return fileUrl ? "View File" : "No file uploaded";
    }
    return fileName || "Upload file";
  };

  return (
    <>
      <div className={`${styles.uploadBlock} ${styles[className] || ""}`}>
        <p>
          {label}
          {required && <span style={{ color: "red" }}>*</span>}
        </p>
        <div
          className={`${styles.uploadWrapper} uploadWrapper ${wrapperClassName}`}
          onClick={handleClick}
        >
          <div className={styles.imgIcon}>
            <img src={images.uploadIcon} alt="upload-icon" />
          </div>
          <div className={styles.contentUploadBlock}>
            <p>{getDisplayText()}</p>
          </div>
        </div>
        <input
          type="file"
          id={id}
          onChange={handleFileChange}
          style={{ display: "none" }}
          accept=".jpg, .jpeg, .png, .pdf, image/jpeg, image/jpg, image/png, application/pdf"
        />
      </div>

      <SnackbarNotification
        snackbar={snackbar}
        handleClose={handleCloseSnackbar}
      />
    </>
  );
};

export default UploadFile;
