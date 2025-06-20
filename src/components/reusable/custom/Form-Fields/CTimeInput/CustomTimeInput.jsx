import React, { useState } from "react";
import styles from "./custom-time-input.module.css";
const CustomTimeInput = ({
  name,
  value,
  label,
  required,
  onChange,
  touched,
  error,
}) => {
  const [timeValue, setTimeValue] = useState(value || "12:00");
  const [period, setPeriod] = useState("AM"); // To handle AM/PM
  // Function to handle time changes
  const handleTimeChange = (e) => {
    const newTime = e.target.value;
    setTimeValue(newTime);

    const [hours] = newTime.split(":");
    const intHours = parseInt(hours, 10);

    // Automatically switch AM/PM based on time
    if (intHours >= 12) {
      setPeriod("PM");
    } else {
      setPeriod("AM");
    }

    // Pass the formatted time with the correct AM/PM to the parent component
    onChange({
      target: {
        name: e.target.name,
        value: formatTimeTo12Hour(newTime, intHours >= 12 ? "PM" : "AM"),
      },
    });
  };

  // Function to handle AM/PM switch
  const handlePeriodToggle = (e) => {
    const newPeriod = period === "AM" ? "PM" : "AM";
    setPeriod(newPeriod);

    const formatedTime = formatTimeTo12Hour(timeValue, newPeriod);
    // Pass the formatted time with the updated period to the parent component
    onChange({
      target: {
        name: e.target.name,
        value: formatedTime,
      },
    });
  };

  // Function to format the time to 12-hour format
  const formatTimeTo12Hour = (time, period) => {
    let [hours, minutes] = time.split(":");
    hours = parseInt(hours, 10);

    if (period === "PM" && hours < 12) {
      hours += 12;
    } else if (period === "AM" && hours === 12) {
      hours = 0; // Midnight case
    }

    return `${hours.toString().padStart(2, "0")}:${minutes}`;
  };
  return (
    <div className={styles.customTimeInput}>
      <label htmlFor={name}>
        <p>
          {label}{" "}
          {required ? (
            <span style={{ color: "red" }}>*</span>
          ) : (
            <span style={{ fontSize: "14px" }}>(optional)</span>
          )}
        </p>
      </label>
      <div className={styles.inputWrapper}>
        <input
          type="time"
          id={name}
          name={name}
          required={required}
          value={value}
          onChange={handleTimeChange}
        />
        {/* AM/PM toggle button */}
        {/* <span type="button" onClick={handlePeriodToggle} style={{ padding: '5px' }}> */}
        {/* <span style={{ padding: '5px' }}>
                    <p>{period}</p>
                </span> */}
      </div>

      {touched && error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default CustomTimeInput;
