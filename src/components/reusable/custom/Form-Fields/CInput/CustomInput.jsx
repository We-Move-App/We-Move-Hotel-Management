import React, { useState, useEffect } from 'react';
import styles from './custom-input.module.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { VscUnverified, VscVerifiedFilled } from "react-icons/vsc";

const CustomInput = ({
  label, name,
  type = 'text', placeholder = '',
  takeSpecialChar = false, alphaNumeric = false, floatNumber = false,
  value, onChange, isDisabled = false,
  required = false, error, touched,
  onBlur, verifyStatus, handleVerifyStatus,
  boxStyle = {}, style = {}, 
}) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  const handlePasswordToggle = () => {
    setIsPasswordVisible(prev => !prev);
  };

  const handleInputChange = (e) => {
    let newValue = e.target.value;

    // Prevent leading space
    if (newValue[0] === ' ') {
      newValue = newValue.slice(1);
    }

    if (type === 'text') {
      if (takeSpecialChar && alphaNumeric) {
        newValue = newValue.replace(/[^A-Za-z0-9\s\-,.()/#@!$&]/g, '');
      } else if (alphaNumeric) {
        newValue = newValue.replace(/[^a-zA-Z0-9\s]/g, '');
      } else if (!takeSpecialChar) {
        newValue = newValue.replace(/[^a-zA-Z\s]/g, '');
      }
    }

    if (type === 'email') {
      newValue = newValue.replace(/\s/g, '');
    }

    if (type === 'tel') {
      newValue = newValue.replace(/\D/g, '');
    }
    // if (type === 'tel' || type === 'number') {
    //   newValue = newValue.replace(/\D/g, '');
    // }

    if (type === 'number') {
      if (floatNumber) {
        // Allow only digits and a single decimal point
        newValue = newValue.replace(/[^0-9.]/g, '');
        const parts = newValue.split('.');
        if (parts.length > 2) {
          newValue = parts[0] + '.' + parts.slice(1).join('');
        }
      } else {
        newValue = newValue.replace(/\D/g, '');
      }
    }

    setInputValue(newValue);
    onChange({ target: { name, value: newValue } });
  };

  const handleWheel = (e) => {
    if (type === 'number') {
      e.preventDefault();
    }
  };

  useEffect(() => {
    if (type === 'number') {
      const inputEl = document.getElementById(name);
      if (inputEl) {
        inputEl.addEventListener('wheel', handleWheel, { passive: false });
      }

      return () => {
        if (inputEl) {
          inputEl.removeEventListener('wheel', handleWheel);
        }
      };
    }
  }, [type, name]);

  return (
    <div className={styles.customInput} style={boxStyle}>
      <label htmlFor={name}>
        <p>
          {label}
          {required ? <span style={{ color: 'red' }}>*</span> : <span style={{ fontSize: '14px' }}>(optional)</span>}
        </p>
        {verifyStatus === false && (
          <p onClick={handleVerifyStatus}>
            <VscUnverified className={styles.notVerified} /> Verify Now
          </p>
        )}
        {verifyStatus && (
          <p>
            <VscVerifiedFilled className={styles.verified} /> Verified
          </p>
        )}
      </label>

      <div className={`${styles.inputWrapper} ${error && touched ? styles.inputWrapperError : ''}`}>
        <input
          id={name}
          name={name}
          type={type === 'password' && isPasswordVisible ? 'text' : type}
          step={type === 'number' && floatNumber ? 'any' : undefined}
          required={required}
          placeholder={placeholder}
          disabled={isDisabled}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
          onBlur={onBlur}
          className={isDisabled ? styles.disabled : ''}
          style={style}
        />
        {type === 'password' && (
          <span
            onClick={handlePasswordToggle}
            className={styles.passwordToggle}
            role="button"
            aria-label="Toggle password visibility"
          >
            {isPasswordVisible ? <FaEye /> : <FaEyeSlash />}
          </span>
        )}
      </div>

      {touched && error && <div className={styles.error}>{error}</div>}
    </div>
  );
};

export default CustomInput;
