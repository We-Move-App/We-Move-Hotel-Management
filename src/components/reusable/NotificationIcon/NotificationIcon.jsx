import React, { useEffect, useState, useRef } from "react";
import styles from "./notification-icon.module.css";
import { IoPerson } from "react-icons/io5";
import { Bell } from "lucide-react";
import apiCall from "../../../hooks/apiCall";
import { ENDPOINTS } from "../../../utils/apiEndpoints";
import { useTranslation } from "react-i18next";
import { useOutsideClick } from "../../../hooks/useOutsideClick";

const NotificationIcon = () => {
  const { t } = useTranslation("common");
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef(null);

  //  Derived state (NO useState needed)
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  //  Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);

      const { data, statusCode, success, error } = await apiCall(
        ENDPOINTS.GET_NOTIFICATIONS,
        "GET",
      );

      if (success && statusCode === 200) {
        setNotifications(data?.data?.notifications || []);
      } else {
        console.error("API failed:", error);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  //  Toggle dropdown
  // const handleNotificationClick = () => {
  //   setIsOpen((prev) => !prev);

  //   // Optional: mark all as read locally
  //   setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  // };
  const handleNotificationClick = () => {
    setIsOpen((prev) => {
      if (!prev) {
        setNotifications((n) => n.map((i) => ({ ...i, isRead: true })));
      }
      return !prev;
    });
  };

  //  Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  //  Format subtitle
  const formatSubtitle = (text) => {
    if (!text) return "";
    const index = text.indexOf(" on ");
    return index !== -1 ? text.substring(0, index) : text;
  };

  //  Initial fetch + polling (optional but recommended)
  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 15000); // every 15 sec

    return () => clearInterval(interval);
  }, []);

  useOutsideClick(wrapperRef, () => setIsOpen(false));

  return (
    <div className={styles.notification} ref={wrapperRef}>
      {/* Bell Icon */}
      <div
        className={styles.notificationBlock}
        onClick={handleNotificationClick}
      >
        <div className={styles.bellWrapper}>
          <Bell size={35} color="#FFC107" fill="#FFC107" strokeWidth={1.5} />

          {unreadCount > 0 && (
            <span className={styles.notificationCount}>
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className={styles.dropdown}>
          {/* Header */}
          <div className={styles.dropdownHeader}>
            <span>{t("notification.title")}</span>
          </div>

          {/* Content */}
          <div className={styles.dropdownContent}>
            {loading ? (
              <p className={styles.loader}>Loading...</p>
            ) : notifications.length === 0 ? (
              <p className={styles.empty}>
                {t("notification.noNotifications")}
              </p>
            ) : (
              notifications.map((item) => (
                <div key={item._id} className={styles.notificationItem}>
                  {/* Icon */}
                  <div className={styles.iconCircle}>
                    <IoPerson size={20} color="#111" />
                  </div>

                  {/* Text */}
                  <div className={styles.textBlock}>
                    <div className={styles.titleRow}>
                      <span className={styles.title}>{item.title}</span>
                      {!item.isRead && <span className={styles.dot}></span>}
                    </div>

                    <p className={styles.subTitle}>
                      {formatSubtitle(item.subTitle)}
                    </p>
                  </div>

                  {/* Date */}
                  <div className={styles.date}>
                    {formatDate(item.createdAt)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationIcon;
