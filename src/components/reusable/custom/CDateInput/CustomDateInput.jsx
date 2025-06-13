import React, { useRef, useState } from 'react'
import styles from './custom-date-input.module.css';
import { FaCalendarAlt } from 'react-icons/fa';

const CustomDateInput = () => {
    const [selectedDate, setSelectedDate] = useState('');
    const dateInputRef = useRef(null);

    const handleIconClick = () => {
        // Trigger the date input click programmatically
        if (dateInputRef.current) {
            dateInputRef.current.click();
        }
    };

    const handleDateChange = (e) => {
        setSelectedDate(e.target.value);
    };

    return (
        <div className={styles.dateInputContainer}>
            {/* <label htmlFor="dateInput" className={styles.dateLabel}> Select a Date</label> */}
            <div className={styles.dateInputWrapper}>
                <FaCalendarAlt className={styles.calendarIcon} onClick={handleIconClick}  />
                <input
                    type="text"
                    placeholder='DD/MM/YYYY'
                    value={selectedDate}
                    className={styles.dateInput}
                    // onChange={handleDateChange}
                    // onFocus={(e) => (e.target.type = 'date')}
                    // onBlur={(e) => (e.target.type = 'text')}
                    readOnly
                />
                {/* Hidden input of type 'date' */}
                <input
                    ref={dateInputRef}
                    type='date'
                    id='dateInput'
                    // hidden={true}
                    // className={styles['hidden-input']}
                    onChange={handleDateChange}
                />
            </div>


            {selectedDate && (
                <div >
                    <strong>Selected Date:</strong> {selectedDate}
                </div>
            )}
        </div>
    )
}

export default CustomDateInput