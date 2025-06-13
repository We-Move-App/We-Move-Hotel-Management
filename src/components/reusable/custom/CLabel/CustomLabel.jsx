import React from 'react'
import styles from './custom-label.module.css';
import GlobalStyles from '../../../../utils/GlobalStyles';

const CustomLabel = ({ labelText, htmlFor, required = false, ...props }) => {
    return (
        <label className={styles.label} htmlFor={htmlFor} >
            <p>{labelText} <span className='error-message' style={{fontSize: GlobalStyles.fontSizeSmall}} >{required && '*'}</span></p>
        </label>
    )
}

export default CustomLabel