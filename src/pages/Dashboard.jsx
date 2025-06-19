import React, { useEffect, useState } from 'react'

import { SquareArrowOutUpRight } from 'lucide-react'

import styles from './dashboard.module.css';

import CustomButton from '../components/reusable/custom/CButton/CustomButton';
import DebitCard from '../components/DebitCard/DebitCard';
import TodayEarningCard from '../components/TodayEarningCard/TodayEarningCard';
import RoomOccupancy from '../components/RoomOccupancyChart/RoomOccupancy';
import BookingRevenue from '../components/BookingRevenue/BookingRevenue';
import SearchBar from '../components/SearchBar/SearchBar';
import CustomTable from '../components/Table/CustomTable';
import useNavigation from '../hooks/useNavigation';

const Dashboard = () => {
  const {goTo} = useNavigation()
  return (
    <>
      <div className={styles.headerBox}>
        <h1>Dashboard</h1>
        <div>
          <CustomButton
            buttonText={"Export"}
            style={{ width:"100%",  }}
            // buttonSize={'medium'}
            icon={<SquareArrowOutUpRight style={{ color: 'white' }} />}
            // onClick={()=> goTo('/dashboard/profile')}
          // icon={<img src={images.exportIcon}  alt="export" />}
          />
        </div>
      </div>

      <div className={styles.reportContianer}>
        <p className={styles.sectionHeading}>Reports</p>
        <div className={styles.reportsBox}>
          <div className={styles.highAnalyticsBox}>

            <div className={styles.debitAndEarningCardContainer}>
              <div className={styles.card}> <DebitCard /></div>
              <div className={`${styles.card} ${styles.earningCard}`}><TodayEarningCard /></div>
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
            <SearchBar onSearch={(searchQuery) => { console.log(searchQuery) }} />
          </div>
          <CustomTable
            columns={[
              { Header: 'Transaction ID', accessor: 'transactionId' },
              { Header: 'User Name', accessor: 'userName' },
              { Header: 'Amount', accessor: 'amount' },
            ]}
            data={[
              { transactionId: 'OL6768057', userName: 'Harry Potter', amount: 89988998 },
              { transactionId: 'OL6768057', userName: 'Jane Smith', amount: 89988998 },
              { transactionId: 'OL6768057', userName: 'Dr. Banner', amount: 89988998 },
              { transactionId: 'OL6768057', userName: 'John Wick', amount: 89988998 },
              { transactionId: 'OL6768057', userName: 'Tony Stark', amount: 89988998 },
              { transactionId: 'OL6768057', userName: 'Scarlet Witch', amount: 89988998 },
            ]}
            customRowClass="customRow"
            customCellClass="customCell"
            fontSize='small'
          />
        </div>
      </div>

    </>
  )
}


const backgroundColors1 = [20, 80,].map(value =>
  value > 75 ? 'rgba(255, 184, 90, 1)' : 'rgba(45, 106, 79, 1)'
);
// Dummy data and options for the chart
const dummyData = {
  labels: ['Rooms Avalaible', 'Booked Rooms',],
  datasets: [
    {
      label: 'Dataset 1',
      data: [80, 20,],
      fill: false,
      backgroundColor: ['rgba(45, 106, 79, 1)', 'rgba(255, 184, 90, 1)'],
      borderColor: ['rgba(45, 106, 79, 1)', 'rgba(255, 184, 90, 1)'],
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

      position: 'right',
    },
    title: {
      display: false,
      text: 'Dummy Chart Title',
    },
  },
};
export default Dashboard