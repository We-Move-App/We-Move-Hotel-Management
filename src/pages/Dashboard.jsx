import React, { useEffect, useState } from "react";

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
  const [loading, setLoading] = useState(false);

  // const formattedTransactions = transactions.map((tx) => {
  //   const date = new Date(tx.createdAt);

  //   return {
  //     transactionId: `${tx.transactionId?.slice(
  //       0,
  //       6
  //     )}...${tx.transactionId?.slice(-4)}`,
  //     userName: "N/A", // Replace if you have user data
  //     date: date.toLocaleDateString(), // e.g., "06/08/2025"
  //     time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), // e.g., "12:15 PM"
  //     amount: tx.amount,
  //     status: tx.type, // No such field in your API
  //   };
  // });

  const fetchTransactions = async (searchQuery = "") => {
    try {
      setLoading(true);
      const token = tokenFromLocalStorage();

      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/v1/wallet/transactions`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            entity: "hotelManager",
            ...(searchQuery ? { transactionId: searchQuery } : {}),
          },
        }
      );

      console.log("fetchTransactions res.data:", res?.data);

      const inner = res?.data?.data;

      let rawArray = [];
      if (!inner) {
        rawArray = [];
      } else if (Array.isArray(inner.transactions)) {
        rawArray = inner.transactions;
      } else if (Array.isArray(inner)) {
        rawArray = inner;
      } else if (typeof inner === "object") {
        rawArray = [inner];
      } else {
        rawArray = [];
      }

      console.log("rawArray length:", rawArray.length);
      console.table(rawArray.slice(0, 5));

      setTransactions(rawArray);
      const formatted = rawArray.map((t, idx) => {
        const txId = t.transactionId || t._id || t.id || `tx-${idx}`;
        const createdAt = t.createdAt || t.created_at || "";
        let date = "";
        let time = "";
        if (createdAt) {
          const dt = new Date(createdAt);
          if (!Number.isNaN(dt.getTime())) {
            date = dt.toLocaleDateString();
            time = dt.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });
          }
        }

        return {
          id: txId,
          transactionId: txId,
          date,
          time,
          amount: t.amount ?? t.amountPaid ?? t.transactionAmount ?? "",
          status: t.status ?? t.state ?? "",
          __raw: t,
        };
      });

      console.log("formatted (first 5):");
      console.table(formatted.slice(0, 5));

      setFormattedTransactions(formatted);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setTransactions([]);
      setFormattedTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);
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
