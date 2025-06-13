import React from 'react'
import styles from './custom-radio-button.module.css';

const CustomRadioButton = ({ id, label, name, checked, onChange }) => {
    return (
        <label className={styles.radioContainer}>
            <input
                type="radio"
                id={id}
                name={name}
                checked={checked}
                onChange={onChange}
                className={styles.radioInput}
            />
            <span className={styles.customRadio}></span>
            {label}
        </label>
    )
}

export default CustomRadioButton