import React, { useEffect, useState } from "react";
import styles from "./debit-card.module.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { AiOutlineEyeInvisible, AiOutlineEye } from "react-icons/ai";
import axios from "axios";
import { useTranslation } from "react-i18next";

const DebitCard = ({ showAmount = false, amount }) => {
  const { t } = useTranslation("common");
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
          },
        );

        const apiAmount = res.data?.data || 0;
        setWalletAmount(apiAmount);
      } catch (err) {
        throw new Error(err?.message || err);
      }
    };

    fetchWalletAmount();
  }, [amount]);

  return (
    <div className={styles.debitCard}>
      <div className={styles.cardDetails}>
        <p className={styles.text}>{t("debitCard.title")}</p>
        <p className={styles.text}>
          <span style={{ fontFamily: "monospace", letterSpacing: "0.5px" }}>
            {showCardNumber ? "1234 5678 9012 3456" : "**** **** **** ****"}
          </span>

          <span onClick={toggleShowCardNumber} className={styles.showHideBtn}>
            {showCardNumber ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
          </span>
        </p>
      </div>
      {showAmount && (
        <div className={styles.amount}>
          <p>
            {new Intl.NumberFormat("en", {
              style: "currency",
              currency: walletAmount?.currency || "INR",
              // currencyDisplay: "code",
            }).format(walletAmount?.balance ?? 0)}

            {/* ------ for 100 eur ------- */}
            {/* {walletAmount?.balance?.toLocaleString() ?? "0"} */}
            {/* {walletAmount?.currency === "INR"
              ? "₹"
              : walletAmount?.currency + " "}{" "} */}
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
