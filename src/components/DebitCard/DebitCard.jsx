import React, { useEffect, useState } from "react";
import styles from "./debit-card.module.css";
import { AiOutlineEyeInvisible, AiOutlineEye } from "react-icons/ai";
import axios from "axios";
import { useTranslation } from "react-i18next";

const DebitCard = ({
  showAmount = false,
  refreshWallet = false,
}) => {
  const { t } = useTranslation("common");

  const [showCardNumber, setShowCardNumber] = useState(false);

  const [walletAmount, setWalletAmount] = useState({
    balance: 0,
    currency: "EUR",
    cardNumber: "",
  });

  const toggleShowCardNumber = () => {
    setShowCardNumber((prev) => !prev);
  };

  useEffect(() => {
    const fetchWalletAmount = async () => {
      try {
        const tokenData = localStorage.getItem("WEMOVE_TOKEN");

        const accessToken = tokenData
          ? JSON.parse(tokenData)?.accessToken
          : null;

        if (!accessToken) {
          console.warn("No token found.");
          return;
        }

        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/v1/wallet/details`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        setWalletAmount(
          res?.data?.data || {
            balance: 0,
            currency: "EUR",
            cardNumber: "",
          },
        );
      } catch (err) {
        console.error("Wallet fetch failed:", err);
      }
    };

    fetchWalletAmount();
  }, [refreshWallet]);

  // format card number
  const formattedCardNumber = walletAmount?.cardNumber
    ? walletAmount.cardNumber.replace(/(\d{4})(?=\d)/g, "$1 ")
    : "**** **** **** ****";

  return (
    <div className={styles.debitCard}>
      <div className={styles.cardDetails}>
        <p className={styles.text}>
          {t("debitCard.title")}
        </p>

        <p className={styles.text}>
          <span
            style={{
              fontFamily: "monospace",
              letterSpacing: "0.5px",
            }}
          >
            {showCardNumber
              ? formattedCardNumber
              : "**** **** **** ****"}
          </span>

          <span
            onClick={toggleShowCardNumber}
            className={styles.showHideBtn}
          >
            {showCardNumber ? (
              <AiOutlineEye />
            ) : (
              <AiOutlineEyeInvisible />
            )}
          </span>
        </p>
      </div>

      {showAmount && (
        <div className={styles.amount}>
          <p>
            {new Intl.NumberFormat("en", {
              style: "currency",
              currency: walletAmount?.currency || "EUR",
            }).format(Number(walletAmount?.balance || 0))}
          </p>
        </div>
      )}
    </div>
  );
};

export default DebitCard;