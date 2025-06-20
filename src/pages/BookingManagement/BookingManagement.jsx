import React, { useEffect, useState } from "react";
import styles from "./booking-management.module.css";
import CustomButton from "../../components/reusable/custom/CButton/CustomButton";
import { SquareArrowOutUpRight } from "lucide-react";
import SearchBar from "../../components/SearchBar/SearchBar";
import CustomTable from "../../components/Table/CustomTable";
import PaginationComponent from "../../components/reusable/Pagination/PaginationComponent";
import GlobalStyles from "../../utils/GlobalStyles";
import { IoAdd } from "react-icons/io5";
import { LuFilter } from "react-icons/lu";
import useNavigation from "../../hooks/useNavigation";
import apiCall from "../../hooks/apiCall";
import { ENDPOINTS } from "../../utils/apiEndpoints";
import { tokenFromLocalStorage } from "../../utils/helperFunctions";
import { useFormattedDate } from "../../hooks/formatISODate";
import ContentHeading from "../../components/reusable/Content-Heading/ContentHeading";

const BookingManagement = () => {
  const formatDate = useFormattedDate();
  // const token = tokenFromLocalStorage();
  const hotelID = localStorage.getItem("WEMOVE_HOTELID") || "";
  const [bookings, setBookings] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const { goTo } = useNavigation();
  const [totalPage, setTotalPage] = useState(0);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // const getBookings = async () => {
  //     const { data, statusCode, error, success } = await apiCall(`${ENDPOINTS.HOTEL_BOOKINGS}?hotelId=${hotelID}&page=${currentPage}`, 'GET');

  //     if (success) {
  //         console.log(data)
  //         const { bookings, currentPage, totalPages } = data.data;
  //         setCurrentPage(currentPage);
  //         setTotalPage(totalPages || 1);
  //         const hotelIdByToken = JSON.parse(localStorage.getItem("WEMOVE_USER"))?._id || '';

  //         const formattedBookings = bookings?.map( (b) => {
  //             const user = {};
  //             if (b.bookedBy == hotelIdByToken) {
  //                 const { data, success, statusCode, error } =  apiCall(`${ENDPOINTS.PROFILE}`, 'GET');

  //                 console.log("BOOKED BY MANAGER", data.data.user)
  //                 console.log("BOOKED BY DATA", data)
  //                 user.fullName = data?.data?.user?.fullName;
  //                 user.phoneNumber = data?.data?.user?.phoneNumber;
  //             } else {
  //                 console.log("BOOKED BY USER")
  //                 // const {data, success, statusCode, error} = await apiCall();
  //             }
  //             // if (b.bookedBy === hotelIdByToken) {

  //             // } else {

  //             // }
  //             return {
  //                 bookingId: b?._id || '',
  //                 roomType: b?.roomTypeId?.roomType || '',
  //                 guestName: user.fullName || '',
  //                 // guestName: b?.bookedBy?.fullName || '',
  //                 mobileNumber: user?.phoneNumber || '',
  //                 // mobileNumber: b?.bookedBy?.phoneNumber || '',
  //                 checkIn: formatDate(b?.checkInDate) || '',
  //                 checkOut: formatDate(b?.checkOutDate) || '',
  //                 adult: b?.noOfAdults || '',
  //                 child: b?.noOfKids || ''
  //             }
  //         })
  //         setBookings(formattedBookings);
  //     }
  // }
  const getBookings = async () => {
    const hotelIdByToken =
      JSON.parse(localStorage.getItem("WEMOVE_USER"))?._id || "";

    // Step 1: Fetch all bookings
    const { data, statusCode, error, success } = await apiCall(
      `${ENDPOINTS.HOTEL_BOOKINGS}?hotelId=${hotelID}&page=${currentPage}`,
      "GET"
    );

    if (!success) return;

    const { bookings, currentPage: serverPage, totalPages } = data.data;
    // console.log("BOOKINGS",bookings)
    setCurrentPage(serverPage);
    setTotalPage(totalPages || 1);

    // Step 2: Check if any booking is by the manager
    const isManagerBooking = bookings?.some(
      (b) => b.bookedBy === hotelIdByToken
    );

    let managerProfile = null;
    if (isManagerBooking) {
      const { data, error, statusCode, success } = await apiCall(
        `${ENDPOINTS.PROFILE}`,
        "GET"
      );
      if (success) {
        managerProfile = data.data.user;
      }
    }

    // Step 3: Format all bookings
    const formattedBookings = bookings.map((b) => {
      const isByManager = b.bookedBy._id === hotelIdByToken;

      const userInfo = isByManager
        ? {
            fullName: b.user[0].name || "Null",
            phoneNumber: b.user[0].phoneNumber || "Null",
          }
        : {
            fullName: b?.bookedBy?.fullName || "Null",
            phoneNumber: b?.bookedBy?.phoneNumber || "Null",
          };

      return {
        bookingId: b?._id || "",
        roomType: b?.roomTypeId?.roomType || "",
        guestName: userInfo.fullName,
        mobileNumber: userInfo.phoneNumber,
        checkIn: formatDate(b?.checkInDate),
        checkOut: formatDate(b?.checkOutDate),
        adult: b?.noOfAdults || "",
        child: b?.noOfKids || "",
        bookedBy: b?.bookingBy,
      };
    });

    setBookings(formattedBookings);
  };

  useEffect(() => {
    getBookings();
  }, [currentPage]);

  return (
    <div className={styles.bookingManagement}>
      <div className={styles.headerBox}>
        {/* <h1>Booking Management</h1> */}
        <ContentHeading heading="Booking Management" />
        <div>
          <CustomButton
            buttonText={"Export"}
            buttonSize={"medium"}
            // style={{ height: '64px', padding: '17px 24px' }}
            icon={<SquareArrowOutUpRight style={{ color: "white" }} />}
          />
        </div>
      </div>

      <div className={styles.headerBoxActionsContainer}>
        <div className={styles.headerBoxHeadingAndSearchWrapper}>
          <p className={styles.subheading}>Guest Booking Details</p>
          {/* <SearchBar styles={{ width: '400px' }} /> */}
        </div>

        <div className={styles.headerBoxActionsBox}>
          <div className={styles.searchbarWrapper}>
            <SearchBar styles={{ width: "100%" }} />
          </div>
          <div className={styles.filterAndAddUserBox}>
            <div className={styles.actionBtn}>
              <CustomButton
                buttonText={"Filter"}
                type={"button"}
                buttonSize={"small"}
                // style={{ border: `1px solid ${GlobalStyles.colorPrimaryLight}` }}
                textColor={GlobalStyles.colorPrimaryLight}
                bgColor={GlobalStyles.colorPrimaryLightType4}
                icon={
                  <LuFilter
                    style={{
                      fontSize: GlobalStyles.fontSizeSmall,
                      fontWeight: GlobalStyles.fontWeightBold,
                    }}
                  />
                }
              />
            </div>

            <div className={`${styles.actionBtn} ${styles.addGuest}`}>
              <CustomButton
                buttonText={"Add New Guest"}
                type={"button"}
                buttonSize={"small"}
                style={{
                  border: `1px solid ${GlobalStyles.colorPrimaryLight}`,
                }}
                textColor={GlobalStyles.colorPrimaryLight}
                bgColor={GlobalStyles.colorWhite}
                onClick={() => goTo("/dashboard/booking-management/add")}
                icon={
                  <IoAdd
                    style={{
                      fontSize: GlobalStyles.fontSizeSmall,
                      fontWeight: GlobalStyles.fontWeightBold,
                    }}
                  />
                }
              />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.tableBoxWrapper}>
        <CustomTable
          // fontSize='medium'
          columns={[
            { Header: "Booking ID", accessor: "bookingId" },
            { Header: "Room Type", accessor: "roomType" },
            { Header: "Guest Name", accessor: "guestName" },
            { Header: "Mobile Number", accessor: "mobileNumber" },
            { Header: "Checkin Date", accessor: "checkIn" },
            { Header: "Checkout Date", accessor: "checkOut" },
            { Header: "Adult", accessor: "adult" },
            { Header: "Child", accessor: "child" },
            { Header: "Booked By", accessor: "bookedBy" },
          ]}
          data={
            bookings || [
              {
                bookingId: "01",
                roomType: "standard",
                guestName: "Harry Potter",
                mobileNumber: "9876543210",
                checkIn: "12.09.2025",
                checkOut: "13.09.2024",
                adult: 2,
                child: 1,
              },
              {
                bookingId: "02",
                roomType: "luxury",
                guestName: "Jane Smith",
                mobileNumber: "9876543210",
                checkIn: "12.09.2025",
                checkOut: "13.09.2024",
                adult: 2,
                child: "N/A",
              },
              {
                bookingId: "03",
                roomType: "standard",
                guestName: "Dr. Banner",
                mobileNumber: "9876543210",
                checkIn: "12.09.2025",
                checkOut: "13.09.2024",
                adult: 2,
                child: 1,
              },
            ]
          }
          customRowClass="customRow"
          customCellClass="customCell"
        />
        {bookings.length <= 0 && (
          <p className={styles.dataNotFound}>Data not available.</p>
        )}

        {totalPage > 0 && (
          <div className={styles.paginationWrapper}>
            <PaginationComponent
              currentPage={currentPage}
              totalPages={totalPage}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingManagement;
