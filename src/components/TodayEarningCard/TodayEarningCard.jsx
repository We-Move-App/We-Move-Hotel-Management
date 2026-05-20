import { useEffect, useMemo, useState } from "react";
import styles from "./today-earning-card.module.css";
import images from "../../assets/images";
import axios from "axios";
import { useTranslation } from "react-i18next";

const TodayEarningCard = () => {
  const { t } = useTranslation("common");
  const [dailyIncome, setDailyIncome] = useState(null);
  useEffect(() => {
    const fetchWalletAmount = async () => {
      const tokenData = localStorage.getItem("WEMOVE_TOKEN");
      const accessToken = tokenData ? JSON.parse(tokenData)?.accessToken : null;

      if (!accessToken) {
        console.warn("No token found.");
        return;
      }

      try {
        const res = await axios.get(
          `${
            import.meta.env.VITE_BASE_URL
          }/api/v1/wallet/analytics?entity=hotelManager&filter=daily`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        const apiAmount = res.data?.data || 0;
        // console.log("💳 Wallet API Response:", res.data);
        setDailyIncome(apiAmount);
      } catch (err) {
        console.error("Failed to fetch wallet amount", err);
      }
    };

    fetchWalletAmount();
  }, []);

  const todayProfit = useMemo(() => {
    return dailyIncome?.analytics?.[0]?.profit ?? 0;
  }, [dailyIncome]);
  
  return (
    <div
      className={styles.earningCard}
      style={{ backgroundImage: `url(${images.earningCardBackgroundImage})` }}
    >
      <div className={styles.earningDetails}>
        <p className={styles.title}>{t("todayEarning.title")}</p>
        <p className={styles.price}>{todayProfit.toLocaleString()}</p>
      </div>
    </div>
  );
};

export default TodayEarningCard;
