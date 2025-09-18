import { useState, useEffect } from "react";
import { Doughnut } from "react-chartjs-2";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import styles from "./room-occupancy.module.css";
import apiCall from "../../hooks/apiCall";
import { ENDPOINTS } from "../../utils/apiEndpoints";

ChartJS.register(ArcElement, Tooltip, Legend);

function RoomOccupancy() {
  const [dateFilter, setDateFilter] = useState("Today");
  const [availableRooms, setAvailableRooms] = useState(0);
  const [bookedRooms, setBookedRooms] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchRoomData = async (hotelId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("WEMOVE_ACCESS_TOKEN");
      const res = await apiCall(
        `${ENDPOINTS.HOTEL_ALL_ROOMS}?hotelId=${hotelId}`,
        "GET",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const roomData = res?.data?.data;
      console.log(roomData);
      if (roomData) {
        setAvailableRooms(roomData.hotelAvailableRooms || 0);
        setBookedRooms(roomData.hotelBookedRooms || 0);
      }
    } catch (error) {
      console.error("Error fetching room data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const hotelId = localStorage.getItem("WEMOVE_HOTELID");
      if (hotelId) {
        fetchRoomData(hotelId);
        clearInterval(interval); // stop polling
      }
    }, 100); // check every 100ms until hotelId is set

    return () => clearInterval(interval);
  }, []);

  const data = {
    labels: ["Available Rooms", "Booked Rooms"],
    datasets: [
      {
        data: [availableRooms, bookedRooms],
        backgroundColor: ["#2E7D32", "#FFA726"],
        borderWidth: 0,
        cutout: "70%",
      },
    ],
  };

  const options = {
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (context) => `${context.label}: ${context.raw}`,
        },
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div className={styles.roomOccupancy}>
      <div className={styles.header}>
        <p className={styles.title}>Room Occupancy</p>
        <select
          className={styles.dateSelector}
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        >
          <option value="Today">Today</option>
          <option value="Yesterday">Yesterday</option>
          <option value="Last Week">Last Week</option>
        </select>
      </div>

      <div className={styles.content}>
        <div className={styles.chartContainer}>
          {loading ? (
            <Skeleton height={200} width={200} circle />
          ) : (
            <Doughnut data={data} options={options} />
          )}
        </div>

        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <div className={`${styles.legendColor} ${styles.available}`}></div>
            <span>
              Available Rooms:{" "}
              {loading ? (
                <Skeleton width={30} />
              ) : (
                <span className={styles.countValue}>{availableRooms}</span>
              )}
            </span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.legendColor} ${styles.booked}`}></div>
            <span>
              Booked Rooms:{" "}
              {loading ? (
                <Skeleton width={30} />
              ) : (
                <span className={styles.countValue}>{bookedRooms}</span>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoomOccupancy;
