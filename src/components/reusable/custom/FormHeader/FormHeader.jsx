import React from 'react';
import styles from './form-header.module.css'

const FormHeader = ({ children, heading, subheading, ...props }) => {
    return (
        <div className={styles.formHeader}>
            <h1 className={styles.heading} style={props.headingStyle}>{heading}</h1>
            <p className={styles.subheading} style={props.subheadingStyle}>{subheading}</p>
            {children}
        </div>
    )
}

export default FormHeader