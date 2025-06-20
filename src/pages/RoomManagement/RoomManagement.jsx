import React, { useEffect, useState } from "react";
import styles from "./room-management.module.css";
import CustomButton from "../../components/reusable/custom/CButton/CustomButton";
import { CiEdit } from "react-icons/ci";
import GlobalStyles from "../../utils/GlobalStyles";
import CustomInput from "../../components/reusable/custom/Form-Fields/CInput/CustomInput";
import CustomDateInput from "../../components/reusable/custom/CDateInput/CustomDateInput";
import ResponsiveDatePickers from "../../components/reusable/DateInput/DateInput";
import CustomTabBar from "../../components/reusable/custom/CTabbar/CustomTabBar";
import CustomModal from "../../components/reusable/custom/CModal/CustomModal";
import CustomLabel from "../../components/reusable/custom/CLabel/CustomLabel";
import CustomTable from "../../components/Table/CustomTable";
import apiCall from "../../hooks/apiCall";
import { ENDPOINTS } from "../../utils/apiEndpoints";
import { tokenFromLocalStorage } from "../../utils/helperFunctions";
import { toast } from "react-toastify";
import { useFormattedDate } from "../../hooks/formatISODate";
import ContentHeading from "../../components/reusable/Content-Heading/ContentHeading";

// const floors = ['G', 'T'];
// const roomsPerFloor = Math.ceil(50 / floors.length);

// const rooms = floors.flatMap((floor, floorIndex) =>
//     Array.from({ length: roomsPerFloor }, (_, i) => {
//         const roomNumber = i + 1;
//         const roomName = `${floor}${roomNumber}`;
//         return {
//             name: roomName,
//             status: Math.random() > 0.5, // true for booked, false for available
//         };
//     })
// );

const RoomManagement = () => {
  const formatDate = useFormattedDate();
  // const token = tokenFromLocalStorage();
  const hotelID = localStorage.getItem("WEMOVE_HOTELID") || "";
  const [date, setDate] = useState();

  const [tabBarData, setTabBarData] = useState([
    { name: "All Room", status: true },
    { name: "Available Rooms", status: false },
    { name: "Reserved Rooms", status: false },
  ]);

  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [bookingId, setBookingId] = useState("");
  const [loading, setLoading] = useState(true);

  const [modalOneError, setModalOneError] = useState(null);
  const [isModalOne, setIsModalOne] = useState(false);
  const closeModalOne = () => {
    setModalOneError(null);
    setIsModalOne(false);
  };

  const [modalTwoError, setModalTwoError] = useState(null);
  const [isModalTwo, setIsModalTwo] = useState(false);
  const closeModalTwo = () => {
    setModalTwoError(null);
    setIsModalTwo(false);
  };

  const [bookingTableData, setBookingTableData] = useState({
    bookingId: "",
    roomType: "",
    guestName: "",
    adult: "",
    children: "",
    checkinDate: "",
    checkoutDate: "",
    mobileNumber: "",
  });

  const modalOpenFor = (room) => {
    // console.log("individual selected room", room)
    setBookingId("");
    setIsModalOne(true);
    setSelectedRoom(room?._id);
  };

  const modalOpenForTwo = async (room) => {
    // console.log("ROOM", room)
    // will get id by params fetch room for that id then find booking details from room.booked by
    setIsModalOne(false);
    // setIsModalTwo(true);
    const hotelIdByToken =
      JSON.parse(localStorage.getItem("WEMOVE_USER"))?._id || "";

    // await getAllRooms();
    setSelectedRoom(room?._id);
    // console.log(room);
    const { data, statusCode, success, error } = await apiCall(
      `${ENDPOINTS.HOTEL_BOOKINGS}?bookingId=${room?.bookingReference}`,
      "GET"
    );
    // console.log("booking data room:", data?.data);
    if (error) {
      // console.log("ERROR FROM MODAL TWO:", error);
      setModalTwoError(error?.message);
    }
    if (success) {
      const {
        assingnedRooms,
        bookedBy,
        hotelId,
        roomTypeId,
        noOfAdults,
        checkInDate,
        checkOutDate,
        noOfRooms,
        noOfKids,
        _id,
      } = data.data.bookings[0];
      // const { fullName, phoneNumber } = bookedBy;
      const userObj = {};
      const { hotelName } = hotelId;

      const { roomType } = roomTypeId;
      console.log("BOOKING DETAILS:", data.data);
      // console.log("BOOKEDBY && HOTELMANAGERID", bookedBy, hotelIdByToken)
      //  hotelIdByToken == bookedBy then find in hotelManager else in Users
      if (typeof bookedBy === "string" && bookedBy == hotelIdByToken) {
        const { data, success, statusCode, error } = await apiCall(
          `${ENDPOINTS.PROFILE}`,
          "GET"
        );

        console.log("BOOKED BY MANAGER", data.data.user);
        // console.log("BOOKED BY DATA", data)
        userObj.fullName = data?.data?.user?.fullName;
        userObj.phoneNumber = data?.data?.user?.phoneNumber;
      } else {
        console.log("BOOKED BY USER", bookedBy);
        userObj.fullName = bookedBy?.fullName || "";
        userObj.phoneNumber = bookedBy?.phoneNumber || "";
      }
      console.log("USER OBJECT:", userObj);

      setBookingTableData({
        bookingId: _id || "",
        roomType: roomType || "",
        adult: noOfAdults || "",
        children: noOfKids || "",
        checkinDate: formatDate(checkInDate) || "",
        checkoutDate: formatDate(checkOutDate) || "",
        guestName: userObj.fullName || "Null",
        mobileNumber: userObj.phoneNumber || "Null",
      });
      setIsModalTwo(true);
    }
  };

  const bookRoom = async () => {
    const { data, statusCode, error, success } = await apiCall(
      `${ENDPOINTS.ALLOT_ROOM}?bookingId=${bookingId}`,
      "PUT",
      { body: { roomId: selectedRoom } }
    );

    // console.log("BOOKED ROOM:",data)
    if (error) {
      toast.info(error.message);
      setModalOneError(error?.message);
      return;
    }
    if (success) {
      // if (success && statusCode === 200) {
      setBookingId("");
      console.log("ALLOTED ROOM :", data);
      setIsModalOne(false);
      setIsModalTwo(true);
      const reqRoom = rooms.filter((r) => r?._id === selectedRoom);
      console.log("room", reqRoom);
      modalOpenForTwo(reqRoom);
    }
  };

  const getAllRooms = async () => {
    const status = tabBarData[0].status
      ? "all"
      : tabBarData[1].status
      ? "available"
      : "booked";
    const { data, statusCode, error, success } = await apiCall(
      `${ENDPOINTS.GET_ALL_ROOMS}?hotelId=${hotelID}&status=${status}&date=${date}`,
      "GET"
    );

    if (success && statusCode === 200) {
      console.log("HOTEL ROOMS:", data);
      const { rooms } = data.data;
      setRooms(rooms);
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    console.log("checkout here");
    const { data, statusCode, success, error } = await apiCall(
      `${ENDPOINTS.UPDATE_ROOM_STATUS}?roomId=${selectedRoom}`,
      "PUT",
      {}
    );
    if (error) {
      console.log(error);
      return;
    }
    if (success) {
      console.log("ROOM VACANT:", data.data);
      getAllRooms();
    }
  };

  useEffect(() => {
    console.log(date);
    getAllRooms();
  }, [tabBarData, date, loading, isModalOne, isModalTwo]);

  // useEffect(() => {
  //     console.log('GET BOOKING DETAILS', selectedRoom)
  // }, [isModalTwo])

  // if(loading) return <div>loading....</div>

  return (
    <div className={styles.roomManagement}>
      <div className={styles.headerBox}>
        {/* <h1>Room Management</h1> */}
        <ContentHeading heading="Room Management" />
      </div>
      {isModalOne && (
        <CustomModal isOpen={isModalOne} onClose={closeModalOne}>
          <div className={styles.modalContentBox}>
            <div className={styles.modalOneBox}>
              <CustomInput
                label={"Booking Id"}
                type="text"
                alphaNumeric={true}
                required={true}
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                boxStyle={{ width: "100%" }}
              />
              <CustomButton
                buttonText={"Assign Room"}
                type={"button"}
                style={{ height: "60px", width: "256px" }}
                onClick={bookRoom}
              />
            </div>
            {modalOneError && (
              <div className={styles.error}>{modalOneError}</div>
            )}
          </div>
        </CustomModal>
      )}
      {isModalTwo && (
        <CustomModal isOpen={isModalTwo} onClose={closeModalTwo}>
          <div className={styles.modalTwoBox}>
            <p>Booking Details</p>

            <CustomTable
              columns={[
                { Header: "Booking Id", accessor: "bookingId" },
                { Header: "Room Type", accessor: "roomType" },
                { Header: "Guest Name", accessor: "guestName" },
                { Header: "Mobile Number", accessor: "mobileNumber" },
                { Header: "Checkin Date", accessor: "checkinDate" },
                { Header: "Checkout Date", accessor: "checkoutDate" },
                { Header: "Adult", accessor: "adult" },
                { Header: "Child", accessor: "child" },
              ]}
              data={[
                {
                  bookingId: bookingTableData?.bookingId || "roomId",
                  roomType: bookingTableData?.roomType || "r-type",
                  guestName: bookingTableData?.guestName || "",
                  mobileNumber: bookingTableData?.mobileNumber || "",
                  checkinDate: bookingTableData?.checkinDate || "",
                  checkoutDate: bookingTableData?.checkoutDate || "",
                  adult: bookingTableData?.adult || 0,
                  child: bookingTableData?.children || 0,
                },
              ]}
              customRowClass="customRow"
              customCellClass="customCell"
            />

            <div className={styles.checkoutButton}>
              <CustomButton
                buttonSize={"small"}
                buttonText={"Checkout"}
                onClick={handleCheckout}
              />
            </div>
          </div>
        </CustomModal>
      )}
      <div className={styles.roomDetailsBox}>
        <p>Room Details</p>
        <div className={styles.roomDetailsHeader}>
          <CustomTabBar tabBarData={tabBarData} setTabBarData={setTabBarData} />
          <div className={styles.datePickerWrapper}>
            {/* <CustomInput type='datetime-local' /> */}
            {/* <CustomDateInput/> */}
            <ResponsiveDatePickers
              textColor="#000000"
              backgroundColor={GlobalStyles.colorPrimaryLightType4}
              setDate={setDate}
            />
          </div>
        </div>
        <div className={styles.gridBoxWrapper}>
          {tabBarData[0].status && <p>Total Rooms</p>}
          {tabBarData[1].status && <p>Available Rooms</p>}
          {tabBarData[2].status && <p>Reserved Rooms</p>}

          <div className={styles.typeIdentifierBox}>
            <div className={styles.reserved}>
              <span></span>Reserved
            </div>
            <div className={styles.available}>
              <span></span>Available
            </div>
            <div>
              <span>T-Series:</span> Luxury
            </div>
            <div>
              <span>G-Series:</span> Standard
            </div>
          </div>

          <div className={styles.roomGridWrapper}>
            <div className={styles.roomGridWrapper}>
              {rooms.length === 0 ? (
                <div>No Data Found</div>
              ) : (
                <div className={styles.roomGrid}>
                  {rooms?.map((room) => (
                    <div key={room?._id} className={styles.room}>
                      <div
                        className={`${
                          room.isAvailable
                            ? styles.statusTrue
                            : styles.statusFalse
                        }`}
                        onClick={() => {
                          room.isAvailable
                            ? modalOpenFor(room)
                            : modalOpenForTwo(room);
                        }}
                      ></div>
                      <p>{room?.roomNumber.toUpperCase()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomManagement;
