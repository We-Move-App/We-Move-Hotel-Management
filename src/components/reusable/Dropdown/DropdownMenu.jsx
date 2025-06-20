import React, { useState } from "react";
import styles from "./dropdown-menu.module.css";

const DropdownMenu = ({ options, Icon, buttonLabel = "View List" }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={styles.dropdownContainer}>
      {Icon ? (
        <Icon className={styles.icon} onClick={() => setOpen(!open)} />
      ) : (
        <button className={styles.viewButton} onClick={() => setOpen(!open)}>
          {buttonLabel}
        </button>
      )}
      {open && (
        <div className={styles.dropdownMenu}>
          {options.length > 0 ? (
            options.map((option, index) => (
              <React.Fragment key={index}>
                <button
                  className={styles.menuItem}
                  onClick={() => {
                    setOpen(false);
                    option.onClick();
                  }}
                >
                  {option.label}
                </button>
                {index !== options.length - 1 && (
                  <div className={styles.divider}></div>
                )}
              </React.Fragment>
            ))
          ) : (
            <div className={styles.noData}>No Data Available</div>
          )}
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;
