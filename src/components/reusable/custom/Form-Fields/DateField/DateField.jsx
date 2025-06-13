import React from 'react'
import styles from './date-field.module.css';
import CustomLabel from '../../CLabel/CustomLabel';
import { FaRegCalendarAlt } from "react-icons/fa";

const DateField = ({ labelText, name, onChange, dateValue, required = false }) => {
    const handleChange = (event) => {
        console.log('date', event.target.value)
    }
    return (
        <div className={styles.dateFieldContainer}>
            {labelText && <CustomLabel labelText={labelText} required={required} />}
            <div className={`${styles.inputBox} ${styles.border}`}>
                <FaRegCalendarAlt className={styles.icon} />
                <input
                    type="date"
                    name={name}
                    onChange={handleChange}
                    value={dateValue}
                    className={styles.input}
                />

            </div>

            {/* {
                <div>
                    error display here.
                </div>
            } */}
        </div>
    )
}

export default DateField