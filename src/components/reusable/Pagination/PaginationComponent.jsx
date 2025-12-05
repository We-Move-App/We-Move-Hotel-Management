import React from "react";
import styles from "./pagination.module.css";

const PaginationComponent = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange = () => {},
}) => {
  const getPageNumbers = () => {
    const pages = [];
    const totalShownPages = 3;
    const firstPage = 1;
    const lastPage = Math.max(1, Number(totalPages));

    if (lastPage <= totalShownPages + 2) {
      for (let i = 1; i <= lastPage; i++) pages.push(i);
      return pages;
    }

    if (currentPage <= 2) {
      for (let i = 1; i <= totalShownPages; i++) pages.push(i);
      pages.push("...");
      pages.push(lastPage);
      return pages;
    }

    if (currentPage >= lastPage - 1) {
      pages.push(firstPage);
      pages.push("...");
      for (let i = lastPage - 2; i <= lastPage; i++) pages.push(i);
      return pages;
    }

    pages.push(firstPage);
    pages.push("...");
    pages.push(currentPage - 1);
    pages.push(currentPage);
    pages.push(currentPage + 1);
    pages.push("...");
    pages.push(lastPage);
    return pages;
  };

  const safeOnPageChange = (page) => {
    const p =
      typeof page === "string" && /^\d+$/.test(page)
        ? Number(page)
        : Number(page);
    if (!Number.isFinite(p) || p < 1 || p > Number(totalPages)) return;
    if (p === Number(currentPage)) return;
    onPageChange(p);
  };

  if (Number(totalPages) <= 1) return null;

  return (
    <ul className={styles.pagination} aria-label="Pagination">
      <li>
        <button
          type="button"
          className={`${styles.pageItem} ${
            Number(currentPage) === 1 ? styles.disabled : ""
          }`}
          onClick={() =>
            Number(currentPage) > 1 && safeOnPageChange(Number(currentPage) - 1)
          }
          aria-disabled={Number(currentPage) === 1}
        >
          Prev
        </button>
      </li>

      {getPageNumbers().map((page, index) => {
        const isDots = page === "...";
        const isActive = page === currentPage;
        return (
          <li key={index}>
            <button
              type="button"
              className={`${styles.pageItem} ${isDots ? styles.dots : ""} ${
                isActive ? styles.active : ""
              }`}
              onClick={() => {
                if (isDots) return;
                safeOnPageChange(page);
              }}
              aria-current={isActive ? "page" : undefined}
              disabled={isDots}
            >
              {page}
            </button>
          </li>
        );
      })}

      <li>
        <button
          type="button"
          className={`${styles.pageItem} ${
            Number(currentPage) === Number(totalPages) ? styles.disabled : ""
          }`}
          onClick={() =>
            Number(currentPage) < Number(totalPages) &&
            safeOnPageChange(Number(currentPage) + 1)
          }
          aria-disabled={Number(currentPage) === Number(totalPages)}
        >
          Next
        </button>
      </li>
    </ul>
  );
};

export default PaginationComponent;
