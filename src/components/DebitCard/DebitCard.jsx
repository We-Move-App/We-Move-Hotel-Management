import React, { useState } from 'react'
import styles from './debit-card.module.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // For eye icon (you can use any icon library)
import { AiOutlineEyeInvisible, AiOutlineEye } from "react-icons/ai";

const DebitCard = ({ showAmount = false, amount }) => {
    const [showCardNumber, setShowCardNumber] = useState(false);
    const toggleShowCardNumber = () => setShowCardNumber(!showCardNumber);
    return (
        <div className={styles.debitCard}>

            <div className={styles.cardDetails}>
                <p className={styles.text}>Digital Debit Card</p>
                <p className={styles.text}>{showCardNumber ? '1234 5678 9012 3456' : '**** **** **** ****'}
                    <span onClick={toggleShowCardNumber} className={styles.showHideBtn}>
                        {showCardNumber ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
                        {/* {showCardNumber ? <FaEye /> : <FaEyeSlash />} */}
                    </span>
                </p>
            </div>
            {
                showAmount && (
                    <div className={styles.amount}>
                        <p>{amount || '12,000'}</p>
                    </div>
                )
            }
            {/* <div className={styles.cardExpiryDate}>
                <p className={styles.text}>Exp: 05/25</p>
            </div> */}
        </div>
    )
}

export default DebitCard