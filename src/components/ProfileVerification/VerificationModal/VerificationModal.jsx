import React, { useEffect, useState } from 'react'
import styles from './verification-modal.module.css'
import CustomButton from '../../reusable/custom/CButton/CustomButton'
import OTPInput, { ResendOTP } from "otp-input-react";
import { maskInput } from '../../../utils/helperFunctions';
import { useScreen } from '../../../context/ScreenContext';

const VerificationModal = ({ otp, setOTP, onClick, detailsText, resendOtp }) => {
    const { isTablet, isMobile } = useScreen();
    const [showResendOtp, setShowResendOtp] = useState(false);
    const otpInputDimensions = {
        mobile: {
            width: '50px',
            height: '60px'
        },
        tab: {
            width: '120px',
            height: '110px'
        }
    }
    const { mobile, email } = detailsText;
    const value = mobile || email;
    const handleClick = () => {
        console.log(otp)
        if (otp === '1234') {
            onClick();
        }
    }

    const handleResendOtp = () => {
        resendOtp()
    }

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;
        const timeoutId = setTimeout(() => {
            if (!signal.aborted) setShowResendOtp(true);
        }, 2 * 60 * 1000)

        return () => {
            controller.abort(); // Marks the signal as aborted
            clearTimeout(timeoutId); // Optional but good practice
            console.log('Aborted and timeout cleared');
        };
    }, [])

    return (
        <div className={styles.mobileModalBox} >
            <div className={styles.mobileModalHeaderBox} >
                <h1 className={styles.modalHeading}>OTP Verification</h1>
                <p className={styles.modalDetailsText}>Enter OTP code sent to {maskInput(value)}</p>
            </div>

            <OTPInput
                value={otp} onChange={setOTP}
                autoFocus OTPLength={4} otpType="number"
                disabled={false} secure
                className={styles.otpInput}
                inputClassName={styles.otpInputField}
                inputStyles={isMobile ? otpInputDimensions.mobile : otpInputDimensions.tab}
            />
            {
                showResendOtp && <p className={styles.otpNotRecivedText} >Don't recieve OTP code</p>
            }
            {
                showResendOtp && <p className={styles.modalResendCode} onClick={handleResendOtp} >Resend Code</p>
            }

            <CustomButton
                type={'button'}
                buttonText={'Verify & Proceed'}
                buttonSize={'medium'}
                onClick={handleClick}
            />
        </div>
    )
}

export default VerificationModal