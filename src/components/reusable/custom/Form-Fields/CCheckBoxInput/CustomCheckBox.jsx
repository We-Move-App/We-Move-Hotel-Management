import React from 'react';
import styles from './custom-checkbox.module.css';
import { DiVim } from 'react-icons/di';

const CustomCheckBox = ({ label, checked = false, name, onChange, error, variant = 'default', ...props }) => {
    // console.log(name, label, checked)
    return (
        <label className={`${styles.customCheckbox} ${variant === 'grey' ? styles.greyCheckbox : ''}`}>
            {label}
            <input
                type="checkbox"
                name={name}
                className={styles.checkboxInput}
                checked={checked}
                onChange={onChange}
            />
            <span className={styles.checkmark}></span>
            {error && <div className='error-message' style={{ marginTop: '0px' }}><span>{error}</span></div> }
        </label>
    );
}

export default CustomCheckBox;
