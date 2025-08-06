import React, { useEffect, useState } from "react";
import styles from "./debit-card.module.css";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // For eye icon (you can use any icon library)
import { AiOutlineEyeInvisible, AiOutlineEye } from "react-icons/ai";
import axios from "axios";

const DebitCard = ({ showAmount = false, amount }) => {
  const [showCardNumber, setShowCardNumber] = useState(false);
  const toggleShowCardNumber = () => setShowCardNumber(!showCardNumber);
  const [walletAmount, setWalletAmount] = useState(null);

  useEffect(() => {
    const fetchWalletAmount = async () => {
      if (amount) return;

      const tokenData = localStorage.getItem("WEMOVE_TOKEN");
      const accessToken = tokenData ? JSON.parse(tokenData)?.accessToken : null;

      if (!accessToken) {
        console.warn("No token found.");
        return;
      }

      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/v1/wallet/details`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const apiAmount = res.data?.data || 0;
        // console.log("💳 Wallet API Response:", res.data);
        setWalletAmount(apiAmount);
      } catch (err) {
        console.error("Failed to fetch wallet amount", err);
      }
    };

    fetchWalletAmount();
  }, [amount]);

  return (
    <div className={styles.debitCard}>
      <div className={styles.cardDetails}>
        <p className={styles.text}>Digital Debit Card</p>
        <p className={styles.text}>
          {showCardNumber ? "1234 5678 9012 3456" : "**** **** **** ****"}
          <span onClick={toggleShowCardNumber} className={styles.showHideBtn}>
            {showCardNumber ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
            {/* {showCardNumber ? <FaEye /> : <FaEyeSlash />} */}
          </span>
        </p>
      </div>
      {showAmount && (
        <div className={styles.amount}>
          {/* <p>{amount || "12,000"}</p> */}
          <p>
            {walletAmount?.balance.toLocaleString()}{" "}
            {walletAmount?.currency === "INR"
              ? "₹"
              : walletAmount?.currency + " "}{" "}
          </p>
        </div>
      )}
      {/* <div className={styles.cardExpiryDate}>
                <p className={styles.text}>Exp: 05/25</p>
            </div> */}
    </div>
  );
};

export default DebitCard;
