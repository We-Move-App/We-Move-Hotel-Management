import React from 'react';
import styles from './select-input.module.css';
import { CgProfile } from "react-icons/cg";

const SelectInput = ({ options = [], value, onChange, name, placeholder = "Select" }) => {
    return (
        <div className={styles.selectBox}>
            <CgProfile className={styles.icon} />
            <select
                className={styles.select}
                value={value}
                onChange={onChange}
                name={name}
            >
                <option value="">{placeholder}</option>
                {options?.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default SelectInput;
