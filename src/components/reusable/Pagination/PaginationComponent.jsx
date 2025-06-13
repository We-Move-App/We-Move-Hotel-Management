import React from 'react';
import styles from './pagination.module.css';

const PaginationComponent = ({ currentPage, totalPages, onPageChange }) => {

    const getPageNumbers = () => {
        const pages = [];
        const totalShownPages = 3; // Number of pages to show around the current page
        const firstPage = 1;
        const lastPage = totalPages;
    
        if (totalPages <= totalShownPages + 2) {
            // If total pages are small, display all pages
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 2) {
                // Close to the beginning, show the first few pages and the last page
                for (let i = 1; i <= totalShownPages; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(lastPage);
            } else if (currentPage >= totalPages - 1) {
                // Close to the end, show the first page and the last few pages
                pages.push(firstPage);
                pages.push('...');
                for (let i = totalPages - 2; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                // Middle pages, show the current page and surrounding pages
                pages.push(firstPage);
                pages.push('...');
    
                // Show current page, one page before and one after
                pages.push(currentPage - 1);
                pages.push(currentPage);
                pages.push(currentPage + 1);
    
                pages.push('...');
                pages.push(lastPage);
            }
        }
    
        return pages;
    };
    


    return (
        <ul className={styles.pagination}>
            <li
                className={`${styles.pageItem} ${currentPage === 1 ? styles.disabled : ''}`}
                onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
            >
                Prev
            </li>

            {getPageNumbers().map((page, index) => (
                <li
                    key={index}
                    className={`${styles.pageItem} ${page === '...' ? styles.dots : ''
                        } ${page === currentPage ? styles.active : ''}`}
                    onClick={() => page !== '...' && onPageChange(page)}
                >
                    {page}
                </li>
            ))}

            <li
                className={`${styles.pageItem} ${currentPage === totalPages ? styles.disabled : ''}`}
                onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
            >
                Next
            </li>
        </ul>
    );
};

export default PaginationComponent;
