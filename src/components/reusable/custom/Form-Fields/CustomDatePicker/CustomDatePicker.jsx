import React, { useEffect, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaRegCalendarAlt } from "react-icons/fa";
import styles from './custom-datepicker.module.css'

const CustomDatePicker = ({ value = null, onChange }) => {
    const [selectedDate, setSelectedDate] = useState(value);
    const datePickerRef = useRef(null);

    const handleIconClick = () => {
        // Open the date picker when the calendar icon is clicked
        if (datePickerRef.current) {
            datePickerRef.current.setOpen(true);
        }
    };
    const handleChange = (date) => {
        setSelectedDate(date);
        if (onChange) {
            onChange(date);  // Pass the selected date to Formik
        }
    };

    return (
        <React.Fragment>
            <div className={styles.datePicker}>
                <FaRegCalendarAlt
                    className={styles.icon}
                    size={24}
                    onClick={handleIconClick}
                />
                <DatePicker
                    ref={datePickerRef}
                    selected={selectedDate}
                    className={styles.datePickerInput}
                    onChange={handleChange}
                    placeholderText="Date"
                    dateFormat="dd/MM/yyyy"
                    // readOnly
                />
            </div>
            {/* <div style={{ marginTop: '4px', zIndex: 10, position: 'absolute', fontSize: '14px', fontWeight: 400, color: 'red' }}>Full Name is required</div> */}
        </React.Fragment>
    );
};

export default CustomDatePicker;
