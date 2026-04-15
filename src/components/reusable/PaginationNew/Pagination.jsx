import React from "react";
import styles from "./pagination.module.css";
import { useTranslation } from "react-i18next";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const { t } = useTranslation("common");
  const maxPageNumbersToShow = 5;

  const renderPageNumbers = () => {
    const pageNumbers = [];
    let startPage = Math.max(
      1,
      currentPage - Math.floor(maxPageNumbersToShow / 2),
    );
    let endPage = Math.min(totalPages, startPage + maxPageNumbersToShow - 1);

    if (endPage - startPage < maxPageNumbersToShow - 1) {
      startPage = Math.max(1, endPage - maxPageNumbersToShow + 1);
    }
    if (totalPages <= 1) return null;

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <li
          key={i}
          className={currentPage === i ? styles.active : ""}
          onClick={() => onPageChange(i)}
        >
          {i}
        </li>,
      );
    }
    return pageNumbers;
  };

  return (
    <div className={styles.pagination}>
      <ul>
        <li
          className={currentPage === 1 ? styles.disabled : ""}
          onClick={() => onPageChange(currentPage - 1)}
        >
          {t("pagination.prev")}
        </li>
        {renderPageNumbers()}
        <li
          className={`${currentPage === totalPages ? styles.disabled : ""} ${
            styles.next
          }`}
          onClick={() => onPageChange(currentPage + 1)}
        >
          {t("pagination.next")}
        </li>
      </ul>
    </div>
  );
};

export default Pagination;
