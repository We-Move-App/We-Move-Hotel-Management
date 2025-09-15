import React, { useEffect, useRef, useState } from "react";
import ProfileVerificationLayout from "../../../layouts/ProfileVerificationLayout/ProfileVerificationLayout";

import styles from "./hotel-registration.module.css";
import FormHeader from "../../reusable/custom/FormHeader/FormHeader";
import HotelDetailForm from "./Forms/HotelDetailForm/HotelDetailForm";
import { useFormik } from "formik";
import * as Yup from "yup";
import HotelLocationForm from "./Forms/HotelLocationForm/HotelLocationForm";
import HotelRoomsForm from "./Forms/HotelRoomsForm/HotelRoomsForm";
import HotelPolicyForm from "./Forms/HotelPolicyForm/HotelPolicyForm";
import useNavigation from "../../../hooks/useNavigation";
import callApi from "../../../hooks/callApi";
import { ENDPOINTS } from "../../../utils/apiEndpoints";
import {
  getAmenities,
  getDataFromLocalStorage,
  tokenFromLocalStorage,
} from "../../../utils/helperFunctions";
import apiCall from "../../../hooks/apiCall";
import Loader from "../../reusable/Loader/Loader";

const amenitiesList = [
  { id: 1, name: "Free Wi-Fi" },
  { id: 2, name: "Air Conditioning" },
  { id: 3, name: "Flat-screen TV" },
  { id: 4, name: "Mini Bar" },
  { id: 5, name: "Room Service" },
  { id: 6, name: "Coffee/Tea Maker" },
  { id: 7, name: "Private Bathroom" },
  { id: 8, name: "Safety Deposit Box" },
  { id: 9, name: "Laundry Service" },
];
// const amenitiesList = getAmenities() || [];
// const mappedAmenities = amenitiesList?.map((amenity) => ({
//   ...amenity,
//   checked: false, // Track checked state for each amenity
// }))

const HotelRegistration = () => {
  // State to track the currently active tab
  const formTopRef = useRef(null);
  const [activeTab, setActiveTab] = useState(0);
  const [subheading, setSubheading] = useState("Add your hotel details.");
  const [amenities, setAmenities] = useState([]);
  const token = tokenFromLocalStorage();
  const user = getDataFromLocalStorage("WEMOVE_USER") || {};

  const [loading, setLoading] = useState(true);

  const [multipartFormState, setMultipartFormState] = useState({
    hotelDetails: {
      hotelName: "",
      bussinessLicense: "",
      totalRooms: "",
      files: [],
      termsAndConditions: false,
    },
    hotelLocation: {
      // locationUrl: '',
      hotelAddress: "",
      city: "",
      locality: "",
      latitude: "",
      longitude: "",
      landmark: "",
      pincode: "",
    },
    hotelRoomsAmenities: {
      standardRoom: {
        roomPrice: "",
        numberOfRooms: "",
        files: [],
        amenities: amenities,
      },
      luxuryRoom: {
        roomPrice: "",
        numberOfRooms: "",
        files: [],
        amenities: amenities,
      },
    },
    hotelPolicy: {
      checkingTime: "",
      checkoutTime: "",
      amenities: amenities,
      files: [],
    },
  });

  const [multistepTabs, setMultistepTabs] = useState([
    {
      name: "hotel Details",
      status: false,
      subheading: "Add your hotel details.",
    },
    { name: "location", status: false, subheading: "Add your hotel location." },
    {
      name: "rooms & Amenities",
      status: false,
      subheading: "Add your room details.",
    },
    { name: "policy", status: false, subheading: "Add your hotel details." },
  ]);

  const updateCentralizedState = (step, values) => {
    setMultipartFormState((prevData) => ({
      ...prevData,
      [step]: values,
    }));
  };

  const { goTo } = useNavigation();

  const handleFinalSubmit = () => {
    console.log("Final Form Data: ", multipartFormState);
    // Submit all form data together
    goTo("/profile-verified");
  };

  const toggleTab = (index) => {
    setActiveTab(index);
    setSubheading(multistepTabs[index].subheading);
  };

  const getHotel = async () => {
    try {
      const { data, statusCode, error, success } = await apiCall(
        ENDPOINTS.HOTEL_BY_TOKEN,
        "GET",
        {}
      );
      // console.log(data.data)
      if (success) {
        localStorage.setItem("WEMOVE_HOTELID", data.data.hotel._id);
        const hotelId = data.data.hotel._id;

        await getHotelDetails(hotelId);
        await getHotelLocation(hotelId);
        await getHotelRoomsAndAmenities(hotelId);
        await getHotelPolicy(hotelId);
      }
    } catch (error) {
      console.error("Error fetching hotel", error);
    } finally {
      setLoading(false);
    }

    // return { data }
  };

  const getHotelDetails = async (id) => {
    // Fetch hotel details
    const { data, statusCode, error, success } = await apiCall(
      `${ENDPOINTS.HOTEL_BY_ID}/${id}`,
      "GET",
      {
        // headers: {
        //   Authorization: `Bearer ${token}`
        // }
      }
    );
    if (success) {
      // console.log("HOTEL DETAILS FUN", data);
      // const { hotelName, businessLicense, totalRoom, termsAndConditions, _id } =
      //   data.data.hotel;
      // const { images: files } = data.data?.images[0];

      const {
        hotelName,
        businessLicense,
        totalRoom,
        termsAndConditions,
        _id,
        images: files,
      } = data.data;

      console.log("HotelImages (files):", files);
      const imageIds = files.map((img) => img._id);
      console.log("Hotel Image IDs:", imageIds);

      localStorage.setItem("WEMOVE_HOTEL_IMAGE_IDS", JSON.stringify(imageIds));

      setMultipartFormState((prev) => ({
        ...prev,
        hotelDetails: {
          ...prev.hotelDetails,
          _id,
          hotelName,
          totalRooms: totalRoom,
          bussinessLicense: businessLicense,
          files,
          termsAndConditions,
        },
      }));

      return {
        hotelName,
        businessLicense,
        totalRoom,
        termsAndConditions,
        files,
      };
    }
  };

  const getHotelLocation = async (id) => {
    const { data, statusCode, error, success } = await apiCall(
      `${ENDPOINTS.HOTEL_LOCATION}/${id}`,
      "GET",
      {}
    );
    if (success) {
      // console.log("HOTEL LOCATION FUN", data);
      const hotelAddress = data.data;
      setMultipartFormState((prev) => ({
        ...prev,
        hotelLocation: {
          ...prev.hotelLocation,
          _id: hotelAddress._id,
          city: hotelAddress.townCity,
          pincode: hotelAddress.pincode,
          locality: hotelAddress.state,
          landmark: hotelAddress.landmark,
          hotelAddress: hotelAddress.address,
          latitude: hotelAddress?.coordinates?.latitude || "",
          longitude: hotelAddress?.coordinates?.longitude || "",
        },
      }));
      return { hotelAddress };
    }
  };

  const getHotelRoomsAndAmenities = async (id) => {
    const { data: standardRoomData } = await apiCall(
      `${ENDPOINTS.HOTEL_ROOM}?hotelId=${id}&roomType=standard`,
      "GET",
      {}
    );

    const { data: luxuryRoomData } = await apiCall(
      `${ENDPOINTS.HOTEL_ROOM}?hotelId=${id}&roomType=luxury`,
      "GET",
      {}
    );

    // Handle Standard Room
    if (standardRoomData?.data?.sampleRoom) {
      const {
        amenities,
        hotelId,
        images: files,
        numberOfRoom,
        roomType,
        roomPrice,
        _id,
      } = standardRoomData.data.sampleRoom;

      const structuredAmenites = (amenities || []).map((amenity) => ({
        ...amenity,
        checked: amenity.status,
      }));

      const structuredObject = {
        _id,
        amenities: structuredAmenites,
        numberOfRooms: numberOfRoom,
        files,
        roomPrice,
      };

      setMultipartFormState((prev) => ({
        ...prev,
        hotelRoomsAmenities: {
          ...prev.hotelRoomsAmenities,
          standardRoom: structuredObject,
        },
      }));
    }

    // Handle Luxury Room
    if (luxuryRoomData?.data?.sampleRoom) {
      const {
        amenities,
        hotelId,
        images: files,
        numberOfRoom,
        roomType,
        roomPrice,
        _id,
      } = luxuryRoomData.data.sampleRoom;

      const structuredAmenites = (amenities || []).map((amenity) => ({
        ...amenity,
        checked: amenity.status,
      }));

      const structuredObject = {
        _id,
        amenities: structuredAmenites,
        numberOfRooms: numberOfRoom,
        files,
        roomPrice,
      };

      setMultipartFormState((prev) => ({
        ...prev,
        hotelRoomsAmenities: {
          ...prev.hotelRoomsAmenities,
          luxuryRoom: structuredObject,
        },
      }));
    }
  };

  const getHotelPolicy = async (id) => {
    // Fetch hotel policy
    const { data, statusCode, error, success } = await apiCall(
      `${ENDPOINTS.HOTEL_POLICY}/${id}`,
      "GET",
      {
        // headers: {
        //   Authorization: `Bearer ${token}`
        // }
      }
    );
    if (success && !error) {
      // console.log('HOTEL POLICY FUN', data)
      const {
        checkInTime: checkingTime,
        checkOutTime: checkoutTime,
        amenities,
        uploadDocuments,
        _id,
      } = data?.data;
      const structuredAmenities = amenities?.map((aminity) => ({
        name: aminity.name,
        _id: aminity._id,
        checked: aminity.status,
      }));

      const obj = {
        checkingTime,
        checkoutTime,
        amenities: structuredAmenities,
        files: uploadDocuments,
        _id,
      };
      setMultipartFormState((prev) => ({
        ...prev,
        hotelPolicy: obj,
      }));
      // return obj;
    }
  };

  const getAmenitiesList = async () => {
    const { data, statusCode, error, success } = await apiCall(
      `${ENDPOINTS.GET_AMENITIES}`,
      "GET",
      {}
    );
    if (success) {
      const mappedAmenities = data.data?.map((amenity) => ({
        ...amenity,
        checked: false, // Track checked state for each amenity
      }));
      setAmenities(mappedAmenities);
      console.log(data, amenities);
      setMultipartFormState((prev) => ({
        ...prev,
        hotelRoomsAmenities: {
          ...prev.hotelRoomsAmenities,
          standardRoom: {
            ...prev.hotelRoomsAmenities.standardRoom,
            amenities: mappedAmenities,
          },
          luxuryRoom: {
            ...prev.hotelRoomsAmenities.luxuryRoom,
            amenities: mappedAmenities,
          },
        },
        hotelPolicy: {
          ...prev.hotelPolicy,
          amenities: mappedAmenities,
        },
      }));
      // setLoading(false)
    } else {
      console.log(error);
    }
  };

  useEffect(() => {
    getAmenitiesList();
    // getHotel()
  }, []);

  useEffect(() => {
    // getAmenitiesList();
    getHotel();
  }, [loading]);

  useEffect(() => {
    window.scrollTo({ top: 50, behavior: "smooth" });
    console.log("from window set top:", activeTab);
    if (formTopRef.current) {
      formTopRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [activeTab]);

  const renderStage = () => {
    // It will render active stages of form
    switch (activeTab) {
      case 0:
        return (
          <HotelDetailForm
            initialValues={multipartFormState.hotelDetails}
            onNext={(values) => {
              console.log("hit detail submit");
              updateCentralizedState("hotelDetails", values);
              // setActiveTab(1)
              toggleTab(1);
            }}
          />
        );
      case 1:
        return (
          <HotelLocationForm
            initialValues={multipartFormState.hotelLocation}
            onPrev={() => setCurrentStep(1)}
            setMultipartFormState={setMultipartFormState}
            onNext={(values) => {
              updateCentralizedState("hotelLocation", values);
              // setActiveTab(2)
              toggleTab(2);
            }}
          />
        );
      case 2:
        return (
          <HotelRoomsForm
            initialValues={multipartFormState.hotelRoomsAmenities}
            onPrev={() => setCurrentStep(2)}
            formTopRef={formTopRef}
            onNext={(values) => {
              updateCentralizedState("hotelRoomsAmenities", values);
              // setActiveTab(3)
              toggleTab(3);
            }}
          />
        );
      case 3:
        return (
          <HotelPolicyForm
            initialValues={multipartFormState.hotelPolicy}
            onPrev={() => setCurrentStep(3)}
            onSubmit={(values) => {
              updateCentralizedState("hotelPolicy", values);
              handleFinalSubmit();
            }}
          />
        );
      default:
        return (
          <HotelDetailForm
            initialValues={multipartFormState.hotelDetails}
            onNext={(values) => {
              console.log("hit detail submit");
              updateCentralizedState("hotelDetails", values);
              // setActiveTab(1)
              toggleTab(1);
            }}
          />
        );
    }
  };

  if (!token) {
    goTo("/signup");
  }

  if (loading) {
    return (
      <div className={styles.loaderParent}>
        <Loader />
      </div>
    );
  }

  return (
    <div
      className={styles.formContainer}
      id={styles.multiStepFormParent}
      ref={formTopRef}
    >
      <FormHeader
        heading={"Hotel Registration"}
        subheading={subheading}
        headingStyle={{ fontSize: "32px" }}
      >
        {/* Multipart form tabs. */}
        <div className={styles.tabsBox}>
          {multistepTabs?.map((tab, index) => (
            <div
              key={index}
              onClick={() => toggleTab(index)}
              // className={`${styles.tab} ${activeTab >= index ? styles.active : ''}`}>
              className={`${styles.tab} ${
                activeTab === index ? styles.active : ""
              }`}
            >
              {tab?.name}
            </div>
          ))}
        </div>
      </FormHeader>

      {/* Form */}
      <div id={styles["form-parent"]}>{renderStage()}</div>
    </div>
  );
};

export default HotelRegistration;
