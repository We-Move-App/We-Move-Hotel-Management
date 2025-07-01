import React, { useEffect, useState } from "react";
import styles from "./custom-tabBar.module.css";

const CustomTabBar = ({
  variant = "default",
  tabBarData = [],
  setTabBarData,
  intialActiveTab = 0,
  externalActiveTab,
  setExternalActiveTab,
  onTabChange,
}) => {
  const [activeTab, setActiveTab] = useState(intialActiveTab);

  const toggleTab = (index) => {
    setActiveTab(index);
    handleTabBarStatusChange(index);
  };

  const handleTabBarStatusChange = (index) => {
    const updatedTabBarData = tabBarData.map((tab, i) => {
      if (i === index) {
        return { ...tab, status: true };
      }
      return { ...tab, status: false };
    });
    onTabChange?.(index);
    setTabBarData(updatedTabBarData);
    setExternalActiveTab && setExternalActiveTab(index);
  };

  useEffect(() => {
    toggleTab(activeTab);
  }, []);

  useEffect(() => {
    if (externalActiveTab !== undefined && externalActiveTab !== activeTab) {
      toggleTab(externalActiveTab);
    }
  }, [externalActiveTab]);

  return (
    <div className={styles.tabsBox}>
      {tabBarData?.map((tab, index) => (
        <div
          key={index}
          onClick={() => toggleTab(index)}
          className={`
              ${styles.tab} 
              ${
                activeTab === index
                  ? variant === "underline"
                    ? styles.activeUnderline
                    : styles.active
                  : ""
              } 
              ${variant === "underline" ? styles.underlineTab : ""}
            `}
        >
          {tab?.name}
        </div>
      ))}
    </div>
  );
};

export default CustomTabBar;
