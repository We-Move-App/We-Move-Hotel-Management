import React from "react";
import { Snackbar, Alert } from "@mui/material";

const SnackbarNotification = ({ snackbar, handleClose }) => {
  return (
    <Snackbar
      open={snackbar.open}
      autoHideDuration={8000}
      onClose={handleClose}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <Alert
        onClose={handleClose}
        severity={snackbar.severity}
        sx={{ width: "100%" }}
      >
        {snackbar.message}
      </Alert>
    </Snackbar>
  );
};

export default SnackbarNotification;
