import { useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import styles from './room-occupancy.module.css';

ChartJS.register(ArcElement, Tooltip, Legend);

function RoomOccupancy() {
  const [dateFilter, setDateFilter] = useState('Today');

  const data = {
    labels: ['Available Rooms', 'Booked Rooms'],
    datasets: [
      {
        data: [80, 20],
        backgroundColor: ['#2E7D32', '#FFA726'],
        borderWidth: 0,
        cutout: '70%'
      }
    ]
  };

  const options = {
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function (context) {
            return `${context.label}: ${context.raw}`;
          }
        }
      }
    },
    maintainAspectRatio: false
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
          <Doughnut data={data} options={options} />
        </div>

        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <div className={`${styles.legendColor} ${styles.available}`}></div>
            <span>Available Rooms: <span className={styles.countValue}>80</span></span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.legendColor} ${styles.booked}`}></div>
            <span>Booked Rooms: <span className={styles.countValue}>20</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoomOccupancy;