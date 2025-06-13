import React, { useRef } from 'react'
import styles from './custom-file-input.module.css';


const CustomFileInput = ({
    icon, error,
    label, required,
    name, value,
    accept, placeholder,
    onChange, touched, isDisabled, 
}) => {
    const fileInputRef = useRef(null);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            onChange({ target: { name, value: file } });
            // onChange()
        }
    };

    const handleClick = () => {
        fileInputRef.current.click();
    };

    return (
        <div className={styles.customFileInput}>
            <label htmlFor={name}><p>{label} {required && <span style={{ color: 'red' }}>*</span>} </p></label>

            <div className={styles.inputWrapper} onClick={handleClick}>
                {/* {icon &&  icon} */}
                {icon && !value && icon}
                <span >{value ? value?.name || value?.fileName : placeholder}</span>
                <input
                    type="file"
                    ref={fileInputRef}
                    name={name}
                    // value={value}
                    isDisabled={isDisabled}
                    className={styles.hiddenInput}
                    onChange={handleFileChange}
                    accept={accept}
                />
            </div>
            {touched && error ? <div className="error-message">{error} error</div> : null}
        </div>
    )
}

export default CustomFileInput