import * as React from "react";
import dayjs from "dayjs";
import { DemoContainer, DemoItem } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import { TextField } from "@mui/material";

export default function ResponsiveDatePickers({
  height = "39px",
  textColor = "#000000",
  backgroundColor = "#0000",
  setDate,
}) {
  const [selectedDate, setSelectedDate] = React.useState(dayjs());

  React.useEffect(() => {
    setDate && setDate(selectedDate); // Set on load
  }, []);

  const handleChange = (newValue) => {
    setSelectedDate(newValue);
    setDate && setDate(newValue); // Notify parent
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DemoContainer components={["DesktopDatePicker"]}>
        <DemoItem label="">
          <DesktopDatePicker
            defaultValue={selectedDate}
            onChange={handleChange}
            format="MMM DD, YYYY"
            slotProps={{
              textField: {
                sx: {
                  height: height,
                  backgroundColor: backgroundColor,
                  borderRadius: "4px",
                  overflow: "hidden",
                  color: textColor,
                  "& .MuiInputBase-root": {
                    height: height,
                    overflow: "hidden",
                  },
                  "& input": {
                    height: height,
                    // padding: '0 14px',
                    color: textColor,
                    overflow: "hidden",
                  },
                },
              },
            }}
          />
          {/* <DesktopDatePicker
            sx={{
              backgroundColor: backgroundColor,
              height: height
            }}
            defaultValue={dayjs()}
            format="MMM DD, YYYY"
            renderInput={(params) => (
              <TextField
                {...params}
                sx={{
                  input: {
                    color: textColor,
                    // color: "#000", // optional: ensure text is visible
                  },
                  fieldset: {
                    borderColor: '#ccc', // optional: adjust border color
                  },
                }}
              />
            )}
          /> */}
        </DemoItem>
      </DemoContainer>
    </LocalizationProvider>
  );
}
