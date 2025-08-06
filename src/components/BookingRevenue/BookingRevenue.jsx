import React, { useEffect, useState } from "react";
import styles from "./booking-revenue.module.css";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import CustomSelect from "../reusable/custom/CSelect/CustomSelect";
import axios from "axios";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BookingRevenue = () => {
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const [dateFilter, setDateFilter] = useState("Monthly");

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "June",
    "July",
    "Aug",
    "Sept",
    "Oct",
    "Nov",
    "Dec",
  ];

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "white",
        titleColor: "#333",
        bodyColor: "#666",
        bodyFont: {
          size: 14,
          // family: "'Inter', sans-serif"
        },
        titleFont: {
          size: 14,
          // family: "'Inter', sans-serif",
          weight: "600",
        },
        padding: 12,
        borderColor: "#ddd",
        borderWidth: 1,
        displayColors: false,
        callbacks: {
          title: (items) => items[0].label,
          label: (context) => `${context.parsed.y}`,
        },
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        border: {
          // display: false
          display: true,
          dash: [4, 4],
        },
        ticks: {
          color: "#666",
          font: {
            size: 13,
            // family: "'Inter', sans-serif"
          },
          padding: 0,
        },
      },
      y: {
        border: {
          display: false,
          dash: [4, 4],
        },
        grid: {
          color: "#e5e5e5",
          drawTicks: false,
          lineWidth: 0.5,
        },
        ticks: {
          padding: 0,
          color: "#666",
          font: {
            size: 14,
            // family: "'Inter', sans-serif"
          },
          callback: (value) => `${value}`,
        },
        min: 0,
        max: 120,
        stepSize: 10,
      },
    },
    layout: {
      padding: {
        left: 0,
        right: 0,
      },
    },
    barPercentage: 0.2, // Reduced for thinner bars
    categoryPercentage: 1, // Maximum category percentage for more space between months
    animation: {
      duration: 750,
      easing: "easeInOutQuart",
    },
    hover: {
      mode: "index",
      intersect: false,
    },
  };

  const [monthlyData, setMonthlyData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [yearlyData, setYearlyData] = useState([]);

  const getCurrentData = () => {
    let currentData = [];

    if (dateFilter === "Monthly") currentData = monthlyData;
    else if (dateFilter === "Weekly") currentData = weeklyData;
    else if (dateFilter === "Yearly") currentData = yearlyData;

    return {
      labels: currentData.map((item) => item.label),
      datasets: [
        {
          data: currentData.map((item) => item.value),
          backgroundColor: [
            "rgba(255, 99, 132, 0.8)",
            "rgba(144, 238, 144, 0.8)",
            "rgba(64, 224, 208, 0.8)",
            "rgba(135, 206, 235, 0.8)",
            "rgba(152, 251, 152, 0.8)",
            "rgba(255, 215, 0, 0.8)",
            "rgba(255, 160, 122, 0.8)",
            "rgba(0, 206, 209, 0.8)",
            "rgba(255, 182, 193, 0.8)",
            "rgba(65, 105, 225, 0.8)",
            "rgba(64, 224, 208, 0.8)",
            "rgba(144, 238, 144, 0.8)",
          ],
          borderRadius: 6,
          borderSkipped: false,
          barThickness: 20,
          hoverBackgroundColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(144, 238, 144, 1)",
            "rgba(64, 224, 208, 1)",
            "rgba(135, 206, 235, 1)",
            "rgba(152, 251, 152, 1)",
            "rgba(255, 215, 0, 1)",
            "rgba(255, 160, 122, 1)",
            "rgba(0, 206, 209, 1)",
            "rgba(255, 182, 193, 1)",
            "rgba(65, 105, 225, 1)",
            "rgba(64, 224, 208, 1)",
            "rgba(144, 238, 144, 1)",
          ],
        },
      ],
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      const tokenData = localStorage.getItem("WEMOVE_TOKEN");

      if (!tokenData) {
        console.error("WEMOVE_TOKEN not found in localStorage");
        return;
      }

      const { accessToken } = JSON.parse(tokenData);

      const headers = {
        Authorization: `Bearer ${accessToken}`,
      };

      try {
        // Monthly
        const monthlyRes = await axios.get(
          `${BASE_URL}/api/v1/wallet/analytics?entity=hotelManager&filter=monthly`,
          { headers }
        );
        const monthlyAnalytics = monthlyRes.data.data.analytics;
        setMonthlyData(
          monthlyAnalytics.map((item) => ({
            label: item.month,
            value: item.profit,
          }))
        );

        // Yearly
        const yearlyRes = await axios.get(
          `${BASE_URL}/api/v1/wallet/analytics?entity=hotelManager&filter=yearly`,
          { headers }
        );
        const yearlyAnalytics = yearlyRes.data.data.analytics;
        setYearlyData(
          yearlyAnalytics.map((item) => ({
            label: item.year.toString(),
            value: item.profit,
          }))
        );

        // Weekly
        const weeklyRes = await axios.get(
          `${BASE_URL}/api/v1/wallet/analytics?entity=hotelManager&filter=weekly`,
          { headers }
        );
        const weeklyAnalytics = weeklyRes.data.data.analytics;
        setWeeklyData(
          weeklyAnalytics.map((item) => ({
            label: item.week,
            value: item.profit,
          }))
        );
      } catch (error) {
        console.error("Error fetching analytics data", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className={styles["booking-revenue"]}>
      <div className={styles.header}>
        <div className={styles["title-section"]}>
          <p className={styles.title}>Booking Revenue</p>
        </div>
        <select
          className={styles["date-selector"]}
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        >
          <option value="Monthly">Monthly</option>
          <option value="Weekly">Weekly</option>
          <option value="Yearly">Yearly</option>
        </select>
      </div>
      <div className={styles["chart-container"]}>
        <Bar data={getCurrentData()} options={options} />
      </div>
    </div>
  );
};

export default BookingRevenue;
