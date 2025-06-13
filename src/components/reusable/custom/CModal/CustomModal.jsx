import React from 'react'
import styles from './custom-modal.module.css';
import { IoIosCloseCircle } from "react-icons/io";

const CustomModal = ({ isOpen, onClose, title = "", children }) => {
    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={handleOverlayClick}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    {title && <p>{title}</p>}
                    <IoIosCloseCircle className={styles.closeButton} onClick={onClose} />
                </div>
                <div className={styles.content}>
                    {children}
                </div>
            </div>
        </div>
    )
}

export default CustomModal