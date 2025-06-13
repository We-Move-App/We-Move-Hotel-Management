import React, { useState } from 'react'
import styles from './notification-icon.module.css';
import { IoNotifications } from "react-icons/io5";

const NotificationIcon = ({ value = 0 }) => {
    const [count, setCount] = useState(value || 1);

    return (
        <div className={styles.notification}>
            <IoNotifications className={styles.bellIcon} />
            {count > 0 && <span className={styles.notificationCount}>{count}</span>}
        </div>
    )
}

export default NotificationIcon