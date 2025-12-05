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
import { tokenFromLocalStorage } from "../utils/helperFunctions";
import axios from "axios";

const Dashboard = () => {
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
              page
            );
            search = page;
            page = 1;
          }
        }
        page = Number.isFinite(+page) ? Number(page) : 1;
        limit = Number.isFinite(+limit) ? Number(limit) : 10;
        search = typeof search === "string" ? search : "";

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
            headers: { Authorization: `Bearer ${token}` },
            params: {
              entity: "hotelManager",
              page,
              limit,
              ...(search ? { search } : {}),
            },
          }
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
            "[fetchTransactions] response missing pagination object"
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
    []
  );

  useEffect(() => {
    fetchTransactions(1, pagination.limit, searchQuery);
  }, []);

  const handlePageChange = (page) => {
    const p = Number(page) || 1;
    console.debug(
      "[handlePageChange] clicked page ->",
      p,
      "current search:",
      searchQuery
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
        <ContentHeading heading="Dashboard" />
        {/* <div>
          <CustomButton
            buttonText={"Export"}
            style={{ width: "100%" }}
            // buttonSize={'medium'}
            icon={<SquareArrowOutUpRight style={{ color: "white" }} />}
            // onClick={()=> goTo('/dashboard/profile')}
            // icon={<img src={images.exportIcon}  alt="export" />}
          />
        </div> */}
      </div>

      <div className={styles.reportContianer}>
        <p className={styles.sectionHeading}>Reports</p>
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
            <p className={styles.title}>Booking History</p>
            <span className={styles.searchField}>
              <SearchBar onSearch={(q) => fetchTransactions(q)} />
            </span>
          </div>
          <CustomTable
            columns={[
              { Header: "Transaction ID", accessor: "transactionId" },
              // { Header: "User Name", accessor: "userName" },
              { Header: "Date", accessor: "date" },
              { Header: "Time", accessor: "time" },
              { Header: "Amount", accessor: "amount" },
              { Header: "Status", accessor: "status" },
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

const backgroundColors1 = [20, 80].map((value) =>
  value > 75 ? "rgba(255, 184, 90, 1)" : "rgba(45, 106, 79, 1)"
);
// Dummy data and options for the chart
const dummyData = {
  labels: ["Rooms Avalaible", "Booked Rooms"],
  datasets: [
    {
      label: "Dataset 1",
      data: [80, 20],
      fill: false,
      backgroundColor: ["rgba(45, 106, 79, 1)", "rgba(255, 184, 90, 1)"],
      borderColor: ["rgba(45, 106, 79, 1)", "rgba(255, 184, 90, 1)"],
      tension: 0.1,
    },
    // {
    //     label: 'Dataset 2',
    //     data: [28, 48, 40, 19, 86, 27, 90],
    //     fill: false,
    //     borderColor: 'rgb(54, 162, 235)',
    //     tension: 0.1,
    // },
  ],
};

const dummyOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: "right",
    },
    title: {
      display: false,
      text: "Dummy Chart Title",
    },
  },
};
export default Dashboard;
