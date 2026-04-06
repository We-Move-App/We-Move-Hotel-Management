import React, { useState } from "react";
import styles from "./notification-icon.module.css";
import { IoNotifications, IoPerson } from "react-icons/io5";
import apiCall from "../../../hooks/apiCall";
import { ENDPOINTS } from "../../../utils/apiEndpoints";

const NotificationIcon = ({ value = 0 }) => {
  const [count, setCount] = useState(value || 1);
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
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

  const handleNotificationClick = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);

    if (nextState && notifications.length === 0) {
      fetchNotifications();
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const formatSubtitle = (text) => {
    if (!text) return "";

    const index = text.indexOf(" on ");
    return index !== -1 ? text.substring(0, index) : text;
  };

  return (
    <div className={styles.notification}>
      <IoNotifications
        className={styles.bellIcon}
        onClick={handleNotificationClick}
      />
      {count > 0 && <span className={styles.notificationCount}>{count}</span>}
      {/* Dropdown */}
      {isOpen && (
        <div className={styles.dropdown}>
          {/* Header */}
          <div className={styles.dropdownHeader}>
            <span>Notifications</span>
          </div>

          {/* Content */}
          <div className={styles.dropdownContent}>
            {loading ? (
              <p className={styles.loader}>Loading...</p>
            ) : notifications.length === 0 ? (
              <p className={styles.empty}>No notifications</p>
            ) : (
              notifications.map((item) => (
                <div key={item._id} className={styles.notificationItem}>
                  {/* Left icon */}
                  <div className={styles.iconCircle}>
                    <span>
                      <IoPerson size={20} color="#111" />
                    </span>
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
