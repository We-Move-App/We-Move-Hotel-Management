import React, { useState } from 'react'
import styles from './drop-down.module.css'
import { Link } from 'react-router-dom';
import { MdKeyboardArrowDown } from 'react-icons/md';

const CustomDropDown = ({ label, items }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className={styles.dropdown}>
            <button
                className={styles.dropdownButton}
                onClick={toggleDropdown}
            >
                {label && label} <MdKeyboardArrowDown />
            </button>
            {isOpen && (
                <ul className={styles.dropdownContent}>
                    {items.map((item, index) => (
                        <li key={index}>
                            {/* <a href={item.href}>{item.label}</a> */}
                            <p onClick={() => {
                                item.onClick();
                                setIsOpen(false);
                            }} >{item.label}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default CustomDropDown