import React from "react";
import styles from "./custom-table.module.css";
import TableHeader from "./TableHeader";
import PaginationComponent from "../reusable/Pagination/PaginationComponent";

const CustomTable = ({
  fontSize = "medium",
  columns,
  data,
  customRowClass,
  customCellClass,
  currentPage = 1,
  totalPages = 1,
  onPageChange = () => {},
  ...props
}) => {
  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.accessor}
                className={styles[fontSize]}
                style={{ width: `${100 / columns.length}` }}
              >
                {column.Header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={rowIndex % 2 === 0 ? customRowClass : ""}
            >
              {columns.map((column, colIndex) => (
                <td
                  key={colIndex}
                  className={`${styles[fontSize]} ${
                    colIndex === 1 ? customCellClass : ""
                  }`}
                  style={{ width: `${100 / columns.length}%` }}
                >
                  {row[column.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <PaginationComponent
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
};

export default CustomTable;
