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
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useTranslation } from "react-i18next";

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

const HotelManagement = () => {
  const { t } = useTranslation("hotelManagement");
  const [showForm, setShowForm] = useState(false);
  const toggleForm = () => setShowForm(!showForm);
  const { goTo } = useNavigation();
  const [loading, setLoading] = useState(true);
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

  // const [detailsData, setDetailsData] = useState([
  //   {
  //     type: "hotelDetails",
  //     heading: "hotelDetails.heading",
  //     details: [
  //       {
  //         name: "hotelDetails.fields.hotelName",
  //         value: "ABC Hotel",
  //       },
  //       {
  //         name: "hotelDetails.fields.businessLicense",
  //         value: "123123123",
  //       },
  //       {
  //         name: "hotelDetails.fields.totalRooms",
  //         value: "200",
  //       },
  //     ],
  //   },
  //   {
  //     heading: "location.heading",
  //     details: [
  //       { name: "location.fields.address", value: "address" },
  //       { name: "location.fields.city", value: "Delhi" },
  //       { name: "location.fields.locality", value: "xyz" },
  //       { name: "location.fields.landmark", value: "xyz" },
  //       { name: "location.fields.pincode", value: "121212" },
  //     ],
  //   },
  //   {
  //     heading: "roomDetails.heading",
  //     details: [
  //       { name: "roomDetails.fields.standardRooms", value: "" },
  //       { name: "roomDetails.fields.luxuryRooms", value: "" },
  //       { name: "roomDetails.fields.bookedRooms", value: "" },
  //       { name: "roomDetails.fields.vacantRooms", value: "" },
  //     ],
  //   },
  // ]);

  const [detailsData, setDetailsData] = useState([
    {
      type: "hotelDetails",
      heading: "hotelManagement.hotelDetails.heading",
      details: [
        {
          name: "hotelManagement.hotelDetails.fields.hotelName",
          value: "ABC Hotel",
        },
        {
          name: "hotelManagement.hotelDetails.fields.businessLicense",
          value: "123123123",
        },
        {
          name: "hotelManagement.hotelDetails.fields.totalRooms",
          value: "200",
        },
      ],
    },
    {
      type: "location",
      heading: "hotelManagement.location.heading",
      details: [
        {
          name: "hotelManagement.location.fields.address",
          value: "address",
        },
        {
          name: "hotelManagement.location.fields.city",
          value: "Delhi",
        },
        {
          name: "hotelManagement.location.fields.locality",
          value: "xyz",
        },
        {
          name: "hotelManagement.location.fields.landmark",
          value: "xyz",
        },
        {
          name: "hotelManagement.location.fields.pincode",
          value: "121212",
        },
      ],
    },
    {
      type: "roomDetails",
      heading: "hotelManagement.roomDetails.heading",
      details: [
        {
          name: "hotelManagement.roomDetails.fields.standardRooms",
          value: "",
        },
        {
          name: "hotelManagement.roomDetails.fields.luxuryRooms",
          value: "",
        },
        {
          name: "hotelManagement.roomDetails.fields.bookedRooms",
          value: "",
        },
        {
          name: "hotelManagement.roomDetails.fields.vacantRooms",
          value: "",
        },
      ],
    },
  ]);

  const [Amenities, setAmenities] = useState([]);

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
        },
      );
      // console.log(data.data)
      if (success) {
        localStorage.setItem("WEMOVE_HOTELID", data.data.hotel._id);
        const hotelId = data.data.hotel._id;
        // console.log("Hotel ID:", hotelId);

        await getHotelDetails(hotelId);
        await getHotelLocation(hotelId);
        await getHotelRoomsAndAmenities(hotelId);
        // await getBookedAndVacantRooms(hotelId);
        // await getHotelPolicy(hotelId);
      }
    } catch (error) {
      console.error("Error fetching hotel", error);
    } finally {
      setLoading(false);
    }
  };

  const getHotelDetails = async (id) => {
    const { data, success } = await apiCall(
      `${ENDPOINTS.HOTEL_BY_ID}/${id}`,
      "GET",
    );

    if (success) {
      const {
        hotelName,
        businessLicense,
        totalRoom,
        images: files,
      } = data.data;

      setGridImages(files);

      setDetailsData((prev) =>
        prev.map((section) => {
          if (section?.type === "hotelDetails") {
            return {
              ...section, // ✅ preserve structure
              heading: "hotelDetails.heading",
              details: [
                {
                  name: "hotelDetails.fields.hotelName",
                  value: hotelName || "-",
                },
                {
                  name: "hotelDetails.fields.businessLicense",
                  value: businessLicense || "-",
                },
                {
                  name: "hotelDetails.fields.totalRooms",
                  value: totalRoom || "-",
                },
              ],
            };
          }

          return section;
        }),
      );
    }
  };

  const getHotelLocation = async (id) => {
    const { data, success } = await apiCall(
      `${ENDPOINTS.HOTEL_LOCATION}/${id}`,
      "GET",
    );

    if (success) {
      const hotelAddress = data?.data;

      if (!hotelAddress) return;

      const { landmark, pincode, townCity, state, address } = hotelAddress;

      setDetailsData((prev) =>
        prev.map((section) => {
          if (section?.type === "location") {
            return {
              ...section, //  preserve structure
              heading: "location.heading",
              details: [
                {
                  name: "location.fields.address",
                  value: address || "-",
                },
                {
                  name: "location.fields.city",
                  value: townCity || "-",
                },
                {
                  name: "location.fields.locality",
                  value: state || "-",
                },
                {
                  name: "location.fields.landmark",
                  value: landmark || "-",
                },
                {
                  name: "location.fields.pincode",
                  value: pincode || "-",
                },
              ],
            };
          }

          return section;
        }),
      );
    }
  };

  const getHotelRoomsAndAmenities = async (id) => {
    try {
      //  API calls
      const { data: standardRoomData } = await apiCall(
        `${ENDPOINTS.HOTEL_ROOM}?hotelId=${id}&roomType=standard`,
        "GET",
      );

      const { data: luxuryRoomData } = await apiCall(
        `${ENDPOINTS.HOTEL_ROOM}?hotelId=${id}&roomType=luxury`,
        "GET",
      );

      const { data: bookedRoomData } = await apiCall(
        `${ENDPOINTS.HOTEL_ALL_ROOMS}?hotelId=${id}`,
        "GET",
      );

      const { data: amenitiesData, success: amenitiesSuccess } = await apiCall(
        `${ENDPOINTS.GET_AMENITIES}?hotelId=${id}`,
        "GET",
      );

      //  Safe extraction
      const standardRoomCount =
        standardRoomData?.data?.sampleRoom?.numberOfRoom ?? "0";

      const luxuryRoomCount =
        luxuryRoomData?.data?.sampleRoom?.numberOfRoom ?? "0";

      const bookedCount = bookedRoomData?.data?.hotelBookedRooms ?? 0;
      const vacantCount = bookedRoomData?.data?.hotelAvailableRooms ?? 0;

      // Update state
      setDetailsData((prev) =>
        prev.map((section) => {
          if (section?.type === "roomDetails") {
            return {
              ...section,
              heading: "roomDetails.heading", //  no hotelManagement prefix
              details: [
                {
                  name: "roomDetails.fields.standardRooms",
                  value: standardRoomCount || "-",
                },
                {
                  name: "roomDetails.fields.luxuryRooms",
                  value: luxuryRoomCount || "-",
                },
                {
                  name: "roomDetails.fields.bookedRooms",
                  value: bookedCount || "-",
                },
                {
                  name: "roomDetails.fields.vacantRooms",
                  value: vacantCount || "-",
                },
              ],
            };
          }

          return section;
        }),
      );

      //  Amenities
      if (amenitiesSuccess) {
        const hotelAmenities =
          amenitiesData?.data?.data?.filter((item) => item.type === "hotel") ||
          [];

        setAmenities(hotelAmenities);
      }
    } catch (err) {
      throw new Error(err);
      // console.error("Error fetching hotel data:", err);
    }
  };

  useEffect(() => {
    getHotel();
  }, []);

  return (
    <div className={styles.hotelManagement}>
      {/* {
                showForm && (
                    <HotelRegistration />
                )
            } */}

      {/* Header Box */}
      <div className={styles.headerBox}>
        <ContentHeading heading={t("heading")} />
        <div>
          <CustomButton
            buttonText={t("editBtnText")}
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
      {/* <div className={styles.contentBox}>
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
                <img src={img?.url || img} alt="Hotel" />
              </div>
            ))}
          </div>
        )}
      </div> */}
      <div className={styles.contentDetailsBox}>
        <p className={styles.textBold}>{t("hotelDetails.heading")}</p>

        <div className={styles.detailsBoxWrapper}>
          {loading
            ? Array(3)
                .fill(0)
                .map((_, idx) => (
                  <div key={idx} className={styles.detailsBox}>
                    <p className={styles.detailsBoxHeading}>
                      <Skeleton width={120} />
                    </p>
                    <ul>
                      {Array(3)
                        .fill(0)
                        .map((__, index) => (
                          <li key={index} className={styles.detailsBoxKey}>
                            <Skeleton width={200} />
                          </li>
                        ))}
                    </ul>
                  </div>
                ))
            : detailsData?.map((item, index) => (
                <div key={item.type || index} className={styles.detailsBox}>
                  <p className={styles.detailsBoxHeading}>{t(item?.heading)}</p>

                  <ul>
                    {item?.details?.map((detail, i) => (
                      <li key={i} className={styles.detailsBoxKey}>
                        {t(detail?.name)}:{" "}
                        <span className={styles.textBold}>
                          {detail?.value || "-"}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

          {/* <div key={detailsData.length} className={styles.detailsBox}>
            <p className={styles.detailsBoxHeading}>Amenities</p>
            <div className={styles.amenitiesBox}>
              {loading
                ? Array(4)
                    .fill(0)
                    .map((_, idx) => (
                      <div key={idx} className={styles.amenityItem}>
                        <Skeleton circle width={30} height={30} />
                        <Skeleton width={40} />
                      </div>
                    ))
                : Amenities?.map((amenity, index) => (
                    <div key={index} className={styles.amenityItem}>
                      <img src={amenity.icon} alt={amenity.name} />
                      <span>{amenity.name}</span>
                    </div>
                  ))}
            </div>
          </div> */}
          <div key={detailsData.length} className={styles.detailsBox}>
            <p className={styles.detailsBoxHeading}>{t("amenities.heading")}</p>
            <div className={styles.amenitiesBox}>
              {loading
                ? Array(4)
                    .fill(0)
                    .map((_, idx) => (
                      <div key={idx} className={styles.amenityItem}>
                        <Skeleton circle width={30} height={30} />
                        <Skeleton width={40} />
                      </div>
                    ))
                : Amenities?.filter((amenity) => amenity.type === "hotel").map(
                    (amenity, index) => (
                      <div
                        key={amenity._id || index}
                        className={styles.amenityItem}
                      >
                        {amenity.icon ? (
                          <img src={amenity.icon} alt={amenity.name} />
                        ) : (
                          <div className={styles.noIcon}>No Icon</div>
                        )}
                        <span>{amenity.name}</span>
                      </div>
                    ),
                  )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid Images */}
      <div className={styles.gridLayout}>
        {loading
          ? Array(6)
              .fill(0)
              .map((_, idx) => (
                <div key={idx} className={styles.gridItem}>
                  <Skeleton height={120} />
                </div>
              ))
          : gridImages?.map((img, index) => (
              <div
                key={index}
                className={`${styles.gridItem} ${
                  index % 3 == 0 ? styles.featured : ""
                } `}
              >
                <img src={img?.url || img} alt="Hotel" />
              </div>
            ))}
      </div>
    </div>
  );
};

export default HotelManagement;
