import React, { useCallback, useEffect, useState } from "react";

import { SquareArrowOutUpRight } from "lucide-react";

import styles from "./dashboard.module.css";

import CustomButton from "../components/reusable/custom/CButton/CustomButton";
import DebitCard from "../components/DebitCard/DebitCard";
import TodayEarningCard from "../components/TodayEarningCard/TodayEarningCard";
import RoomOccupancy from "../components/RoomOccupancyChart/RoomOccupancy";
import BookingRevenue from "../components/BookingRevenue/BookingRevenue";
import SearchBar from "../components/SearchBar/SearchBar";
import CustomTable from "../components/Table/CustomTable";
import useNavigation from "../hooks/useNavigation";
import ContentHeading from "../components/reusable/Content-Heading/ContentHeading";
import {
  selectedLanguageFromLocalStorage,
  tokenFromLocalStorage,
} from "../utils/helperFunctions";
import axios from "axios";
import { useTranslation } from "react-i18next";

const Dashboard = () => {
  const { t, i18n } = useTranslation("dashboard");
  const { goTo } = useNavigation();
  const [transactions, setTransactions] = useState([]);
  const [formattedTransactions, setFormattedTransactions] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 10,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const fetchTransactions = useCallback(
    async (page = 1, limit = 10, search = "") => {
      try {
        if (typeof page === "string") {
          const digitsOnly = /^\d+$/.test(page);
          if (digitsOnly) page = Number.parseInt(page, 10);
          else {
            console.warn(
              "[fetchTransactions] first arg non-numeric -> treating as search:",
              page,
            );
            search = page;
            page = 1;
          }
        }
        page = Number.isFinite(+page) ? Number(page) : 1;
        limit = Number.isFinite(+limit) ? Number(limit) : 10;
        search = typeof search === "string" ? search : "";
        const ln = selectedLanguageFromLocalStorage();
        setLoading(true);
        const token = tokenFromLocalStorage();
        console.debug("[fetchTransactions] REQUEST params:", {
          entity: "hotelManager",
          page,
          limit,
          search: search || null,
        });

        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/v1/wallet/transactions`,
          {
            headers: { Authorization: `Bearer ${token}`, ln },
            params: {
              entity: "hotelManager",
              page,
              limit,
              ...(search ? { search } : {}),
            },
          },
        );

        console.debug("[fetchTransactions] RESPONSE raw ->", res?.data);
        const paginationData = res?.data?.data?.pagination;
        if (paginationData) {
          const pagesNum = Number(paginationData.pages) || 1;
          const pageNum = Number(paginationData.page) || 1;
          const totalNum = Number(paginationData.total) || 0;
          const limitNum = Number(paginationData.limit) || limit;

          console.debug("[fetchTransactions] server pagination ->", {
            page: pageNum,
            pages: pagesNum,
            total: totalNum,
            limit: limitNum,
          });

          setPagination({
            page: pageNum,
            pages: pagesNum,
            total: totalNum,
            limit: limitNum,
          });
        } else {
          console.warn(
            "[fetchTransactions] response missing pagination object",
          );
        }
        const inner = res?.data?.data;
        let rawArray = [];
        if (!inner) rawArray = [];
        else if (Array.isArray(inner.transactions))
          rawArray = inner.transactions;
        else if (Array.isArray(inner)) rawArray = inner;
        else if (typeof inner === "object") rawArray = [inner];
        else rawArray = [];

        setTransactions(rawArray);

        const formatted = rawArray.map((t, idx) => {
          const createdAt = t.createdAt || t.created_at;
          const dt = createdAt ? new Date(createdAt) : null;
          return {
            id: t.transactionId || t._id || idx,
            transactionId: t.transactionId || t._id || "",
            date: dt ? dt.toLocaleDateString() : "",
            time: dt
              ? dt.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "",
            amount: t.amount ?? t.amountPaid ?? "",
            status: t.status ?? t.state ?? "",
            __raw: t,
          };
        });

        setFormattedTransactions(formatted);
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setTransactions([]);
        setFormattedTransactions([]);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchTransactions(1, pagination.limit, searchQuery);
  }, [i18n.language]);

  const handlePageChange = (page) => {
    const p = Number(page) || 1;
    console.debug(
      "[handlePageChange] clicked page ->",
      p,
      "current search:",
      searchQuery,
    );
    fetchTransactions(p, pagination.limit, searchQuery);
  };

  const handleSearchSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    fetchTransactions(1, pagination.limit, searchQuery);
  };

  return (
    <>
      <div className={styles.headerBox}>
        <ContentHeading heading={t("heading")} />
      </div>

      <div className={styles.reportContianer}>
        <p className={styles.sectionHeading}>{t("reports")}</p>
        <div className={styles.reportsBox}>
          <div className={styles.highAnalyticsBox}>
            <div className={styles.debitAndEarningCardContainer}>
              <div className={styles.card}>
                {" "}
                <DebitCard showAmount={true} />
              </div>
              <div className={`${styles.card} ${styles.earningCard}`}>
                <TodayEarningCard />
              </div>
            </div>

            <div className={styles.roomOccupancyContainer}>
              <div className={styles.chartCard}>
                <RoomOccupancy />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.bookingRevenueHistoryContianer}>
        {/* <BookingRevenue /> */}
        <div className={styles.bookingRevenue}>
          <BookingRevenue />
        </div>

        <div className={styles.bookingHistory}>
          <div className={styles.bookingHistoryHeader}>
            <p className={styles.title}>{t("bookingHistory")}</p>
            <span className={styles.searchField}>
              <SearchBar onSearch={(q) => fetchTransactions(q)} />
            </span>
          </div>
          <CustomTable
            columns={[
              { Header: t("table.transactionId"), accessor: "transactionId" },
              // { Header: "User Name", accessor: "userName" },
              { Header: t("table.date"), accessor: "date" },
              { Header: t("table.time"), accessor: "time" },
              { Header: t("table.amount"), accessor: "amount" },
              { Header: t("table.status"), accessor: "status" },
            ]}
            data={formattedTransactions}
            customRowClass="customRow"
            customCellClass="customCell"
            currentPage={pagination.page}
            totalPages={pagination.pages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </>
  );
};

export default Dashboard;
