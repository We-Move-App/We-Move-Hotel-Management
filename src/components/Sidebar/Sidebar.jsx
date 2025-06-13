import React, { useEffect, useState } from 'react'
import styles from './sidebar.module.css';
import images from '../../assets/images'
import { IoClose } from "react-icons/io5";
import { Link } from 'react-router-dom';


const sidebarLinks = [
    {
        title: 'Dashboard',
        link: '/dashboard',
        icon: images.dashboardIcon,
    },
    {
        title: 'Hotel Management',
        link: '/dashboard/hotel-management',
        icon: images.hotelManagementIcon,
    },
    {
        title: 'Room Management',
        link: '/dashboard/room-management',
        icon: images.roomManagementIcon,
    },
    {
        title: 'Booking Management',
        link: '/dashboard/booking-management',
        icon: images.bookingManagementIcon,
    },
    {
        title: 'Wallet',
        link: '/dashboard/wallet',
        icon: images.walletIcon,
    },
    {
        title: 'Customer Feedback',
        link: '/dashboard/customer-feedback',
        icon: images.customerFeedbackIcon,
    },
]
const Sidebar = ({ isOpen, toggleSidebar, isMobile, }) => {
    const [active, setActive] = useState(0);

    const handleRouteChange = (index) => {
        // console.log(index)
        setActive(index)
        toggleSidebar();
    }

    // {`${styles.sidebar} ${isMobile && !isOpen ? styles.hideSidebar : ''}`}
    return (
        <div className={`${styles.sidebarContainer} ${isMobile && isOpen ? styles.open : ""}`}>
            {/* <div className={styles.sidebarContainer}> */}
            {/* {isMobile && (
                <span onClick={toggleSidebar} className={styles.closeSidebar}>
                    <IoClose onClick={toggleSidebar} />
                </span>
            )} */}
            <div className={styles.sidebar}>
                <ul className={styles.listBox}>
                    {
                        sidebarLinks?.map((link, index) => {
                            if (index < sidebarLinks.length - 1) {
                                return (
                                    <li key={index} className={styles.listTab} onClick={() => handleRouteChange(index)}>
                                        <Link to={link.link} >
                                            <div className={`${styles.link} ${active === index ? styles.active : ''}`}>
                                                {link.icon ? <img src={link.icon} alt={link.title} /> : '#'}
                                                {/* {link.icon && <img src={link.icon} alt={link.title} />} */}
                                                <span> {link.title}</span>
                                            </div>
                                        </Link>
                                    </li>
                                )
                            }
                        })
                    }
                </ul>
                <ul>
                    {
                        sidebarLinks?.map((link, index) => {
                            if (index === sidebarLinks.length - 1) {
                                return (
                                    <li key={index} className={styles.listTab} onClick={() => setActive(index)}>
                                        <Link to={link.link} >
                                            <div className={`${styles.link} ${active === index ? styles.active : ''}`}>
                                                {link.icon ? <img src={link.icon} alt={link.title} /> : '#'}
                                                {/* {link.icon && <img src={link.icon} alt={link.title} />} */}
                                                <span> {link.title}</span>
                                            </div>
                                        </Link>
                                    </li>
                                )
                            }
                        })
                    }
                    {/* <li>
                        <a href="">
                            {link.icon ? <img src={link.icon} alt={link.title} /> : '#'}
                            {link.icon && <img src={link.icon} alt={link.title} />}
                            <span> Customer Feedback</span>
                        </a>
                    </li> */}
                </ul>
            </div>
        </div>
    )
}

export default Sidebar