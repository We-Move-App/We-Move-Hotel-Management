import React, { useState } from 'react';
import styles from './custom-select.module.css'; // Import the CSS module
import CustomLabel from '../CLabel/CustomLabel';

const CustomSelect = ({ options, label, onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);

    const handleSelect = (option) => {
        setSelectedOption(option);
        setIsOpen(false);
        if (onSelect) onSelect(option); // Call the onSelect prop if provided
    };

    return (
        <div className={styles.customSelect}>
            {/* <label className={styles.selectLabel}>{label}</label> */}
            <CustomLabel labelText={label } />
            <div className={styles.selectBox} onClick={() => setIsOpen(!isOpen)}>
                <div className={styles.selectedValue}>
                    {selectedOption ? selectedOption.label : 'Select an  option'}
                </div>
                <div className={`${styles.arrow} ${isOpen ? styles.arrowOpen : ''}`}>
                    &#9662;
                </div>
            </div>

            {isOpen && (
                <ul className={styles.optionsList}>
                    {options.map((option, index) => (
                        <li
                            key={index}
                            className={`${styles.option} ${selectedOption === option ? styles.optionActive : ''
                                }`}
                            onClick={() => handleSelect(option)}
                        >
                            {option.label}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default CustomSelect;
