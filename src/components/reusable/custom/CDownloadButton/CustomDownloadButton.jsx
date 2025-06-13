import React from 'react'
import styles from './custom-download-button.module.css';
import CustomLabel from '../CLabel/CustomLabel';

const CustomDownloadButton = ({ icon, label, required = false, buttonText = 'View File' }) => {
    return (
        <div className={styles.downloadButton}>
            {/* {label && <CustomLabel labelText={label} />} */}
            <label htmlFor={name}>
                <p>
                    {label} {required ? <span style={{ color: 'red' }}>*</span> : <span style={{ fontSize: '14px' }}>(optional)</span>}
                </p>
            </label>
            <div className={styles.button}>
                {icon && icon}
                {buttonText}
            </div>
        </div>
    )
}

export default CustomDownloadButton