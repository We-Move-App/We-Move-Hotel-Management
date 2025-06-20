import React, { useEffect, useState } from "react";
import styles from "./hotel-management.module.css";
import CustomButton from "../../components/reusable/custom/CButton/CustomButton";
import { CiEdit } from "react-icons/ci";
import GlobalStyles from "../../utils/GlobalStyles";
import images from "../../assets/images";
import HotelRegistration from "../../components/ProfileVerification/HotelRegistration/HotelRegistration";
import useNavigation from "../../hooks/useNavigation";
import apiCall from "../../hooks/apiCall";
import {
  getDataFromLocalStorage,
  tokenFromLocalStorage,
} from "../../utils/helperFunctions";
import { ENDPOINTS } from "../../utils/apiEndpoints";
import ContentHeading from "../../components/reusable/Content-Heading/ContentHeading";

// const detailsData = [
//     {
//         "heading": "Hotel Details",
//         "details": [
//             {
//                 "name": "Hotel Name",
//                 "value": "ABC Hotel"
//             },
//             {
//                 "name": "City",
//                 "value": "New York"
//             },
//             {
//                 "name": "Phone",
//                 "value": "+1 123 456 7890"
//             },
//             {
//                 "name": "Email",
//                 "value": "abc@hotel.com"
//             },
//         ]
//     },
//     {
//         "heading": "Location",
//         "details": [
//             {
//                 "name": "Latitude",
//                 "value": "40.7128° N"
//             },
//             {
//                 "name": "Longitude",
//                 "value": "-74.0060° W"
//             },
//             {
//                 "name": "Map",
//                 "value": "View on Map"
//             }
//         ]
//     },
//     {
//         'heading': "Room Details",
//         "details": [
//             {
//                 "name": "Total Rooms",
//                 "value": "200"
//             },
//             {
//                 "name": "Occupied Rooms",
//                 "value": "150"
//             },
//             {
//                 "name": "Vacant Rooms",
//                 "value": "50"
//             },
//             {
//                 "name": "Booked Rooms",
//                 "value": "20"
//             },
//             {
//                 "name": "Room Rates",
//                 "value": "$200"
//             },
//             {
//                 "name": "Currency",
//                 "value": "USD"
//             }
//         ]
//     },
// ]

const Amenities = [
  {
    icon: images.acIcon,
    name: "A/C",
  },
  {
    icon: images.nonAcIcon,
    name: "Non A/C",
  },
  {
    icon: images.wifiIcon,
    name: "Wifi",
  },
  {
    icon: images.poolIcon,
    name: "Pool",
  },
];

// const gridImages = [
//     images.img1,
//     images.img2,
//     images.img3,
//     images.img4,
//     images.img5,
//     images.img1,
//     images.img2,
//     images.img3,
//     images.img4,
//     images.img5,
// ]
const HotelManagement = () => {
  const [showForm, setShowForm] = useState(false);
  const toggleForm = () => setShowForm(!showForm);
  const { goTo } = useNavigation();
  const [loading, setLoading] = useState(true);
  // const token = tokenFromLocalStorage();
  const user = getDataFromLocalStorage("WEMOVE_USER") || {};

  const [gridImages, setGridImages] = useState([
    images.img1,
    images.img2,
    images.img3,
    images.img4,
    images.img5,
    images.img1,
    images.img2,
    images.img3,
    images.img4,
    images.img5,
  ]);

  const [detailsData, setDetailsData] = useState([
    {
      heading: "Hotel Details",
      details: [
        { name: "Hotel Name", value: "ABC Hotel" },
        { name: "Business License", value: "123123123" },
        { name: "Total Rooms", value: "200" },
      ],
    },
    {
      heading: "Location",
      details: [
        { name: "Addresse", value: "address" },
        { name: "City", value: "Delhi" },
        { name: "Locality", value: "xyz" },
        { name: "Landmark", value: "xyz" },
        { name: "Pincode", value: "121212" },
      ],
    },
    {
      heading: "Room Details",
      details: [
        // { name: "Total Rooms", value: "200" },
        { name: "Standard Rooms", value: "" },
        { name: "Luxury Rooms", value: "" },
        { name: "Booked Rooms", value: "" },
        { name: "Vacant Rooms", value: "" },
        // { name: "Room Rates", value: "$200" },
        // { name: "Currency", value: "USD" },
      ],
    },
  ]);

  const handleNavigation = () => {
    goTo("/dashboard/hotel-management/hotel-registration");
  };

  const getHotel = async () => {
    try {
      const { data, statusCode, error, success } = await apiCall(
        ENDPOINTS.HOTEL_BY_TOKEN,
        "GET",
        {
          // headers: {
          //     Authorization: `Bearer ${token}`
          // }
        }
      );
      // console.log(data.data)
      if (success) {
        localStorage.setItem("WEMOVE_HOTELID", data.data.hotel._id);
        const hotelId = data.data.hotel._id;

        await getHotelDetails(hotelId);
        await getHotelLocation(hotelId);
        await getHotelRoomsAndAmenities(hotelId);
        // await getHotelPolicy(hotelId);
      }
    } catch (error) {
      console.error("Error fetching hotel", error);
    } finally {
      setLoading(false);
    }
  };

  const getHotelDetails = async (id) => {
    // Fetch hotel details
    const { data, statusCode, error, success } = await apiCall(
      `${ENDPOINTS.HOTEL_BY_ID}/${id}`,
      "GET",
      {
        // headers: {
        //     Authorization: `Bearer ${token}`
        // }
      }
    );
    if (success) {
      // console.log("HOTEL DETAILS FUN", data);
      const { hotelName, businessLicense, totalRoom, termsAndConditions, _id } =
        data.data.hotel;
      const { images: files } = data.data?.images[0];
      console.log("HotelImages", files);
      setGridImages(files);
      setDetailsData((prev) =>
        prev.map((section) => {
          if (section?.heading == "Hotel Details") {
            return {
              heading: "Hotel Details",
              details: [
                { name: "Hotel Name", value: hotelName || "ABC Hotel" },
                {
                  name: "Business License",
                  value: businessLicense || "123123123",
                },
                { name: "Total Rooms", value: totalRoom || "200" },
              ],
            };
          } else {
            return section;
          }
        })
      );

      // return { hotelName, businessLicense, totalRoom, termsAndConditions, files }
    }
  };

  const getHotelLocation = async (id) => {
    const { data, statusCode, error, success } = await apiCall(
      `${ENDPOINTS.HOTEL_LOCATION}/${id}`,
      "GET",
      {
        // headers: {
        //     Authorization: `Bearer ${token}`
        // }
      }
    );
    if (success) {
      // console.log("HOTEL LOCATION FUN", data);
      const hotelAddress = data?.data;
      const { landmark, pincode, townCity, state, address } = hotelAddress;
      // console.log("Hotel address:", landmark, pincode, townCity, state)
      setDetailsData((prev) =>
        prev.map((section) => {
          if (section?.heading === "Location") {
            return {
              heading: "Location",
              details: [
                { name: "Addresse", value: address || "hotel Address" },
                { name: "City", value: townCity || "city" },
                { name: "Locality", value: state || "state" },
                { name: "Landmark", value: landmark || "landmark" },
                { name: "Pincode", value: pincode || "pincode" },
              ],
            };
          } else {
            return section;
          }
        })
      );
      // return { hotelAddress };
    }
  };

  const getHotelRoomsAndAmenities = async (id) => {
    const {
      data: standardRoomData,
      statusCode: standardRoomStatusCode,
      error: standardRoomError,
      success: standardRoomSuccess,
    } = await apiCall(
      `${ENDPOINTS.HOTEL_ROOM}?hotelId=${id}&roomType=standard`,
      "GET",
      {}
    );
    const {
      data: luxuryRoomData,
      statusCode: luxuryRoomStatusCode,
      error: luxuryRoomError,
      success: luxuryRoomSuccess,
    } = await apiCall(
      `${ENDPOINTS.HOTEL_ROOM}?hotelId=${id}&roomType=luxury`,
      "GET",
      {}
    );

    console.log("FROM ROOMS DATA COUNT", { standardRoomData, luxuryRoomData });
    const { numberOfRoom: standardRoomCount } = standardRoomData?.data;
    const { numberOfRoom: luxuryRoomCount } = luxuryRoomData?.data;
    setDetailsData((prev) =>
      prev.map((section) => {
        if (section?.heading === "Room Details") {
          return {
            heading: "Room Details",
            details: [
              { name: "Standard Rooms", value: standardRoomCount || "" },
              { name: "Luxury Rooms", value: luxuryRoomCount || "" },
              { name: "Booked Rooms", value: "00" },
              { name: "Vacant Rooms", value: "00" },
            ],
          };
        } else {
          return section;
        }
      })
    );
  };

  // const getHotelPolicy = async (id) => {
  //     // Fetch hotel policy
  //     const { data, statusCode, error, success } = await apiCall(`${ENDPOINTS.HOTEL_POLICY}/${id}`, 'GET', {
  //         headers: {
  //             Authorization: `Bearer ${token}`
  //         }
  //     });
  //     if (success && !error) {
  //         // console.log('HOTEL POLICY FUN', data)
  //         const { checkInTime: checkingTime, checkOutTime: checkoutTime, amenities, uploadDocuments, _id } = data?.data;
  //         const structuredAmenities = amenities?.map((aminity) => ({ name: aminity.name, _id: aminity._id, checked: aminity.status }))

  //         const obj = { checkingTime, checkoutTime, amenities: structuredAmenities, files: uploadDocuments, _id };
  //         // setMultipartFormState((prev) => ({
  //         //     ...prev,
  //         //     hotelPolicy: obj
  //         // }))
  //         return obj;
  //     }

  // }

  useEffect(() => {
    getHotel();
    // console.log(detailsData)
  }, [loading]);

  return (
    <div className={styles.hotelManagement}>
      {/* {
                showForm && (
                    <HotelRegistration />
                )
            } */}

      {/* Header Box */}
      <div className={styles.headerBox}>
        {/* <h1>Hotel Management</h1> */}
        <ContentHeading heading="Hotel Management" />
        <div>
          <CustomButton
            buttonText={"Edit Hotel Details"}
            buttonSize={"medium"}
            style={{ border: `1px solid ${GlobalStyles.colorPrimaryLight}` }}
            bgColor={GlobalStyles.colorWhite}
            textColor={GlobalStyles.colorPrimaryLight}
            onClick={handleNavigation}
            icon={
              <CiEdit
                style={{
                  color: GlobalStyles.colorPrimaryLight,
                  marginRight: "10px",
                }}
              />
            }
          />
        </div>
      </div>

      {/* Content Box */}
      <div className={styles.contentBox}>
        <div className={styles.contentDetailsBox}>
          <p className={styles.textBold}>Hotel Details</p>

          <div className={styles.detailsBoxWrapper}>
            {detailsData?.map((item, index) => (
              <div key={index} className={styles.detailsBox}>
                <p className={styles.detailsBoxHeading}>{item?.heading}</p>
                <ul>
                  {item?.details?.map((detail, index) => (
                    <li key={index} className={styles.detailsBoxKey}>
                      {detail?.name}:{" "}
                      <span className={styles.textBold}>{detail?.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div key={detailsData.length} className={styles.detailsBox}>
              <p className={styles.detailsBoxHeading}>Amenities</p>
              <div className={styles.amenitiesBox}>
                {Amenities?.map((amenity, index) => (
                  <div key={index} className={styles.amenityItem}>
                    <img src={amenity.icon} alt={amenity.name} />
                    <span>{amenity.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {gridImages && (
          <div className={styles.gridLayout}>
            {gridImages?.map((img, index) => (
              <div
                key={index}
                className={`${styles.gridItem} ${
                  index % 3 == 0 ? styles.featured : ""
                } `}
              >
                <img src={img.url} alt="Hotel" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HotelManagement;
