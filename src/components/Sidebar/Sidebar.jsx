import React, { useEffect, useState } from "react";
import styles from "./sidebar.module.css";
import images from "../../assets/images";
import { Link, useLocation } from "react-router-dom";

const mainSidebarLinks = [
  {
    title: "Dashboard",
    link: "/dashboard",
    icon: images.dashboardIcon,
  },
  {
    title: "Hotel Management",
    link: "/dashboard/hotel-management",
    icon: images.hotelManagementIcon,
  },
  {
    title: "Room Management",
    link: "/dashboard/room-management",
    icon: images.roomManagementIcon,
  },
  {
    title: "Booking Management",
    link: "/dashboard/booking-management",
    icon: images.bookingManagementIcon,
  },
  {
    title: "Wallet",
    link: "/dashboard/wallet",
    icon: images.walletIcon,
  },
];

const feedbackLink = {
  title: "Customer Feedback",
  link: "/dashboard/customer-feedback",
  icon: images.customerFeedbackIcon,
};

const Sidebar = ({ isOpen, toggleSidebar, isMobile }) => {
  const location = useLocation();
  const [active, setActive] = useState(0);

  useEffect(() => {
    const currentPath = location.pathname;
    const allLinks = [...mainSidebarLinks, feedbackLink];

    const sortedLinks = [...allLinks].sort(
      (a, b) => b.link.length - a.link.length
    );

    const activeIndex = sortedLinks.findIndex((link) =>
      currentPath.startsWith(link.link)
    );

    if (activeIndex !== -1) {
      const originalIndex = allLinks.findIndex(
        (link) => link.link === sortedLinks[activeIndex].link
      );
      setActive(originalIndex);
    }
  }, [location.pathname]);

  const handleRouteChange = (index) => {
    setActive(index);
    if (isMobile) {
      toggleSidebar();
    }
  };

  return (
    <div
      className={`${styles.sidebarContainer} ${
        isMobile && isOpen ? styles.open : ""
      }`}
    >
      <div className={styles.sidebar}>
        <ul className={styles.listBox}>
          {mainSidebarLinks.map((link, index) => (
            <li
              key={index}
              className={styles.listTab}
              onClick={() => handleRouteChange(index)}
            >
              <Link to={link.link}>
                <div
                  className={`${styles.link} ${
                    active === index ? styles.active : ""
                  }`}
                >
                  {link.icon && <img src={link.icon} alt={link.title} />}
                  <span>{link.title}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <div className={styles.bottomLink}>
          <li
            className={styles.listTab}
            onClick={() => handleRouteChange(mainSidebarLinks.length)}
          >
            <Link to={feedbackLink.link}>
              <div
                className={`${styles.link} ${
                  active === mainSidebarLinks.length ? styles.active : ""
                }`}
              >
                {feedbackLink.icon && (
                  <img src={feedbackLink.icon} alt={feedbackLink.title} />
                )}
                <span>{feedbackLink.title}</span>
              </div>
            </Link>
          </li>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
