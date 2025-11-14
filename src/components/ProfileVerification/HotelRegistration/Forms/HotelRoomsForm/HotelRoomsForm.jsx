import React, { useEffect, useRef, useState } from "react";
import styles from "./hotel-rooms-form.module.css";
import CustomInput from "../../../../reusable/custom/Form-Fields/CInput/CustomInput";
import CustomButton from "../../../../reusable/custom/CButton/CustomButton";
// import CustomDragAndDrop from '../../../../reusable/custom/Form-Fields/CDragAndDrop/CustomDragAndDrop';
import CustomCheckBox from "../../../../reusable/custom/Form-Fields/CCheckBoxInput/CustomCheckBox";
import CustomLabel from "../../../../reusable/custom/CLabel/CustomLabel";
import CustomTabBar from "../../../../reusable/custom/CTabbar/CustomTabBar";

// Global styles varibales
import GlobalStyles from "../../../../../utils/GlobalStyles";
import images from "../../../../../assets/images";

import { useFormik } from "formik";
import * as Yup from "yup";
import DragDrop from "../../../../reusable/custom/D&DFileUpload/DragDrop";
import FilesList from "../../../../reusable/FilesList/FilesList";
import { FileUpload } from "../../../../reusable/custom/Form-Fields/CDragAndDrop/CustomDragAndDrop";
import apiCall from "../../../../../hooks/apiCall";
import { ENDPOINTS } from "../../../../../utils/apiEndpoints";
import { daDK } from "@mui/x-date-pickers/locales";

const SUPPORTED_FORMATS = ["image/jpg", "image/jpeg", "image/png"]; // Supported file types
const FILE_SIZE_LIMIT = 5 * 1024 * 1024; // 5MB size limit

const roomValidationSchema = Yup.object().shape({
  roomPrice: Yup.number().required("Room price is required"),
  // .positive('Room price must be greater than zero'),
  numberOfRooms: Yup.number().required("Number of rooms is required"),
  // .positive('Number of rooms must be greater than zero')
  // .integer('Number of rooms must be an integer'),
  files: Yup.array()
    .of(
      Yup.mixed()
        .required("A file is required")
        .test("file-check", "Invalid file", (value) => {
          // Only validate if it's a local file (File object)
          if (value instanceof File) {
            const validSize = value.size <= FILE_SIZE_LIMIT;
            const validFormat = SUPPORTED_FORMATS.includes(value.type);
            return validSize && validFormat;
          }
          return true; // Skip validation for mapped backend files (e.g. image URLs or meta objects)
        })
    )
    .test("file-count", "At least 3 files required", function (value) {
      // Only run this test if no existing or local files
      const count = value?.length || 0;
      return count >= 3;
    })
    .min(1, "At least one file is required"),
  amenities: Yup.array()
    .of(Yup.mixed())
    .min(1, "At least one amenity must be selected"),
});

const HotelRoomsValidationSchema = Yup.object().shape({
  standardRoom: roomValidationSchema,
  luxuryRoom: roomValidationSchema,
});

const HotelRoomsForm = ({ initialValues, onPrev, onNext, formTopRef }) => {
  // console.log(formik.values)
  const [formError, setFormError] = useState({
    standardError: "",
    luxuryError: "",
  });

  // const ref = useRef(null);

  const [fileProgress, setFileProgress] = useState({
    standardRoom: {},
    luxuryRoom: {},
  });

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: HotelRoomsValidationSchema,
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: async (values) => {
      // console.log("Hotel Rooms Form data:", values);
      try {
        // create standard rooms
        const hotelID = localStorage.getItem("WEMOVE_HOTELID") || "";

        if (hotelID) {
          const standardRoomsForm = new FormData();
          const luxuryRoomsForm = new FormData();

          const {
            numberOfRooms: standard_numberOfRooms,
            roomPrice: standard_roomPrice,
            amenities: standard_amenities,
            files: standardRoomFiles,
          } = values.standardRoom;
          const {
            numberOfRooms: luxury_numberOfRooms,
            roomPrice: luxury_roomPrice,
            amenities: luxury_amenities,
            files: luxuryRoomFiles,
          } = values.luxuryRoom;

          const structuredStandardAmenites = standard_amenities.map(
            (amenity) => {
              const { checked, ...rest } = amenity;
              const modifyedAmenity = {
                ...rest,
                status: checked,
              };
              return modifyedAmenity;
            }
          );
          // standardRoomsForm.append('hotelId', hotelID);
          // standardRoomsForm.append('roomType', 'standard');
          // standardRoomsForm.append('numberOfRoom', standard_numberOfRooms);
          standardRoomsForm.append("roomPrice", standard_roomPrice);
          standardRoomsForm.append(
            "amenities",
            JSON.stringify(structuredStandardAmenites)
          );
          standardRoomsForm.append("luxuryRoomCount", luxury_numberOfRooms);
          standardRoomsForm.append("standardRoomCount", standard_numberOfRooms);

          for (let image of standardRoomFiles) {
            standardRoomsForm.append("roomImages", image);
          }

          const structuredLuxuryAmenites = luxury_amenities.map((amenity) => {
            const { checked, ...rest } = amenity;
            const modifyedAmenity = {
              ...rest,
              status: checked,
            };
            return modifyedAmenity;
          });
          // luxuryRoomsForm.append('hotelId', hotelID);
          // luxuryRoomsForm.append('roomType', 'luxury');
          // luxuryRoomsForm.append('numberOfRoom', luxury_numberOfRooms);
          luxuryRoomsForm.append("roomPrice", luxury_roomPrice);
          luxuryRoomsForm.append(
            "amenities",
            JSON.stringify(structuredLuxuryAmenites)
          );
          luxuryRoomsForm.append("luxuryRoomCount", luxury_numberOfRooms);
          luxuryRoomsForm.append("standardRoomCount", standard_numberOfRooms);

          for (let image of luxuryRoomFiles) {
            luxuryRoomsForm.append("roomImages", image);
          }

          // ------------------------------------------------------------------------------------------------------------------
          const standardRoomId = values.standardRoom._id;
          const luxuryRoomId = values.luxuryRoom._id;
          if (standardRoomId && luxuryRoomId) {
            // update requests
            // console.log("req for UPDATE");

            const {
              data: standardRoomData,
              statusCode: standardRoomStatusCode,
              error: standardRoomError,
              success: standardRoomSuccess,
            } = await apiCall(
              `${ENDPOINTS.HOTEL_ROOM}?hotelId=${hotelID}&roomType=standard`,
              "PUT",
              {
                body: standardRoomsForm,
              }
            );

            const {
              data: luxuryRoomData,
              statusCode: luxuryRoomStatusCode,
              error: luxuryRoomError,
              success: luxuryRoomSuccess,
            } = await apiCall(
              `${ENDPOINTS.HOTEL_ROOM}?hotelId=${hotelID}&roomType=luxury`,
              "PUT",
              {
                body: luxuryRoomsForm,
              }
            );

            if (
              standardRoomError &&
              luxuryRoomError &&
              standardRoomError?.message === luxuryRoomError?.message
            ) {
              setFormError((prev) => ({
                ...prev,
                error: standardRoomError.message,
              }));
            } else {
              if (standardRoomError || standardRoomStatusCode !== 200) {
                // console.log("error from standard:", standardRoomError);
                setFormError((prev) => ({
                  ...prev,
                  standardError: standardRoomError?.message,
                }));
              }
              if (luxuryRoomError || luxuryRoomStatusCode !== 200) {
                setFormError((prev) => ({
                  ...prev,
                  luxuryError: luxuryRoomError?.message,
                }));
              }
            }

            if (
              standardRoomData &&
              standardRoomStatusCode === 200 &&
              standardRoomSuccess &&
              luxuryRoomData &&
              luxuryRoomStatusCode === 200 &&
              luxuryRoomSuccess
            ) {
              // console.log(
              //   standardRoomData,
              //   luxuryRoomData,
              //   standardRoomSuccess,
              //   luxuryRoomSuccess
              // );
              onNext(values);
            }
          } else {
            // posts requests

            // console.log("req for POST")
            const {
              data: standardRoomData,
              statusCode: standardRoomStatusCode,
              error: standardRoomError,
              success: standardRoomSuccess,
            } = await apiCall(
              `${ENDPOINTS.HOTEL_ROOM}?hotelId=${hotelID}&roomType=standard`,
              "POST",
              {
                body: standardRoomsForm,
              }
            );

            const {
              data: luxuryRoomData,
              statusCode: luxuryRoomStatusCode,
              error: luxuryRoomError,
              success: luxuryRoomSuccess,
            } = await apiCall(
              `${ENDPOINTS.HOTEL_ROOM}?hotelId=${hotelID}&roomType=luxury`,
              "POST",
              {
                body: luxuryRoomsForm,
              }
            );

            if (
              standardRoomError &&
              luxuryRoomError &&
              standardRoomError?.message === luxuryRoomError?.message
            ) {
              setFormError((prev) => ({
                ...prev,
                error: standardRoomError.message,
              }));
            } else {
              if (standardRoomError || standardRoomStatusCode !== 201) {
                // console.log("error from standard:", standardRoomError);
                setFormError((prev) => ({
                  ...prev,
                  standardError: standardRoomError?.message,
                }));
              }
              if (luxuryRoomError || luxuryRoomStatusCode !== 201) {
                setFormError((prev) => ({
                  ...prev,
                  luxuryError: luxuryRoomError?.message,
                }));
              }
            }

            if (
              standardRoomData &&
              standardRoomStatusCode === 201 &&
              standardRoomSuccess &&
              luxuryRoomData &&
              luxuryRoomStatusCode === 201 &&
              luxuryRoomSuccess
            ) {
              // onNext: Pass data to parent component
              // console.log(standardRoomData, luxuryRoomData, standardRoomSuccess, luxuryRoomSuccess)
              onNext(values);
            }
          }
        }
      } catch (err) {
        console.error("Error during API call:", err);
      }
    },
  });

  const [fileComponentsCount, setFileComponentsCount] = useState(3); // Default to 3 components
  const [amenitiesCount, setAmenitiesCount] = useState(9); // Default to 3 components

  const [tabBarData, setTabBarData] = useState([
    { name: "Standard room", status: true },
    { name: "Luxury room", status: false },
  ]);
  const [activeTabBar, setActiveTabBar] = useState(
    tabBarData[0].status ? "standardRoom" : "luxuryRoom"
  );
  const [externalActiveTab, setExternalActiveTab] = useState(0);

  // Handle adding more drag-and-drop components
  const handleFilesChange = (newFiles) => {
    // Add new files to the existing ones

    const currentFiles = formik.values[activeTabBar].files;
    formik.setFieldValue(`${activeTabBar}.files`, [
      ...currentFiles,
      ...newFiles,
    ]);
    // Simulate upload progress for new files
    newFiles.forEach((file) => {
      simulateUpload(file);
    });
  };

  const simulateUpload = (file) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      if (progress >= 100) {
        clearInterval(interval);
      }
      setFileProgress((prev) => ({
        ...prev,
        [activeTabBar]: {
          ...activeTabBar,
          [file.name]: Math.min(progress, 100),
        },
        // [file.name]: Math.min(progress, 100)
      }));
    }, 200);
  };

  const removeFile = (index, fileName) => {
    // console.log("removeFile", fileName, index);
    const files = formik.values[activeTabBar].files;
    formik.setFieldValue(`${activeTabBar}.files`, [
      ...files.slice(0, index),
      ...files.slice(index + 1),
    ]);
    setFileProgress((prev) => {
      const { [fileName]: removed, ...rest } = prev;
      return rest;
    });
  };

  const handleAddClick = () => {
    setFileComponentsCount(fileComponentsCount + 1);
  };

  const handleRoomTypeChange = () => {
    // window.focus();
    setTabBarData([
      { name: "Standard room", status: false },
      { name: "Luxury room", status: true },
    ]);
    setExternalActiveTab(1);
    if (formTopRef.current) {
      formTopRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  useEffect(() => {
    setActiveTabBar(tabBarData[0].status ? "standardRoom" : "luxuryRoom");
    // console.log(tabBarData);
  }, [tabBarData]);

  return (
    <form className={styles.form} onSubmit={formik.handleSubmit}>
      <div className={styles.formBoxBorder}>
        <CustomTabBar
          variant={"underline"}
          tabBarData={tabBarData}
          setTabBarData={setTabBarData}
          intialActiveTab={tabBarData[0].status ? 0 : 1}
          externalActiveTab={externalActiveTab}
          setExternalActiveTab={setExternalActiveTab}
        />
        {activeTabBar === "standardRoom" && (
          <div className={styles.formFieldsContainer}>
            <div className={styles.doubleFormFieldsBox}>
              <CustomInput
                required={true}
                // name={activeTabBar['roomPrice']}
                name={"standardRoom.roomPrice"}
                label="Room Price"
                floatNumber={true}
                type="number"
                value={formik.values.standardRoom?.roomPrice}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                boxStyle={{ width: "50%" }}
                error={formik.errors.standardRoom?.roomPrice}
                touched={formik.touched.standardRoom?.roomPrice}
              />
              <CustomInput
                required={true}
                name={"standardRoom.numberOfRooms"}
                label="Number of rooms"
                type="number"
                value={formik.values.standardRoom?.numberOfRooms}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                boxStyle={{ width: "50%" }}
                // error={formik.errors.hotelRoomsAmenities?.numberOfRooms}
                error={formik.errors.standardRoom?.numberOfRooms}
                touched={formik.touched.standardRoom?.numberOfRooms}
              />
            </div>

            <div className={styles.amenitiesContainer}>
              <div className={styles.dragDropLabelBox}>
                <CustomLabel
                  labelText={"Select Amenities"}
                  htmlFor="label"
                  required={true}
                />
                {/* <span><p>Add more</p></span> */}
              </div>

              <div className={styles.amenitiesWrapper}>
                {formik.values?.standardRoom?.amenities?.map(
                  (amenity, index) => (
                    <div className={styles.item} key={index}>
                      <CustomCheckBox
                        label={amenity?.name || "checkbox"}
                        // error={formik?.errors[activeTabBar]?.amenities[index]}
                        // onChange={(e) => formik.setFieldValue(`%${[activeTabBar]}.amenities[${index}].checked`, e.target.checked)}
                        onChange={(e) =>
                          formik.setFieldValue(
                            `standardRoom.amenities[${index}].checked`,
                            e.target.checked
                          )
                        }
                        name={`standardRoom.amenities[${index}].checked`}
                        // checked={formik.values?.standardRoom?.amenities[index]}
                        checked={amenity.checked}
                        variant="grey"
                      />
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Drag and Drop Components Wrapper */}
            <div className={styles.dragDropWrapper}>
              <div className={styles.dragDropLabelBox}>
                <CustomLabel
                  labelText={"Upload Room Photo (min: 3 img)"}
                  required={true}
                  htmlFor={"dragDropBox"}
                />
                {/* <span onClick={handleAddClick}><p>Add more</p></span> */}
              </div>

              <FileUpload
                onFilesChange={handleFilesChange}
                accept={".png,.jpg,.JPEG"}
              />
              <FilesList
                files={formik.values.standardRoom.files}
                fileProgress={fileProgress.standardRoom}
                removeFile={removeFile}
                minRequiredFiles={3}
              />
              <div className={styles.dragDropBox}>
                {/* Drag and Drop Components */}
                {/* Add your drag and drop components here */}
                {/* Dynamically render CustomDragAndDrop components */}
              </div>
            </div>

            <div className={styles.standardFormBtn}>
              <CustomButton
                type={"button"}
                buttonText={
                  formik.values.standardRoom._id ? "Update" : "Continue"
                }
                buttonSize={"small"}
                onClick={handleRoomTypeChange}
              />
            </div>
          </div>
        )}
        {activeTabBar === "luxuryRoom" && (
          <div className={styles.formFieldsContainer}>
            <div className={styles.doubleFormFieldsBox}>
              <CustomInput
                required={true}
                // name={activeTabBar['roomPrice']}
                name={"luxuryRoom.roomPrice"}
                label="Room Price"
                floatNumber={true}
                type="number"
                value={formik.values?.luxuryRoom?.roomPrice}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                boxStyle={{ width: "50%" }}
                error={formik.errors.luxuryRoom?.roomPrice}
                touched={formik.touched.luxuryRoom?.roomPrice}
              />
              <CustomInput
                required={true}
                // name={activeTabBar["numberOfRooms"]}
                name={"luxuryRoom.numberOfRooms"}
                label="Number of rooms"
                type="number"
                value={formik.values?.luxuryRoom?.numberOfRooms}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                boxStyle={{ width: "50%" }}
                // error={formik.errors.hotelRoomsAmenities?.numberOfRooms}
                error={formik.errors.luxuryRoom?.numberOfRooms}
                touched={formik.touched.luxuryRoom?.numberOfRooms}
              />
            </div>

            <div className={styles.amenitiesContainer}>
              <div className={styles.dragDropLabelBox}>
                <CustomLabel
                  labelText={"Select Amenities"}
                  htmlFor="label"
                  required={true}
                />
                {/* <span><p>Add more</p></span> */}
              </div>

              <div className={styles.amenitiesWrapper}>
                {formik.values?.luxuryRoom?.amenities?.map((amenity, index) => (
                  <div className={styles.item} key={index}>
                    <CustomCheckBox
                      label={amenity?.name || "checkbox"}
                      // error={formik?.errors[activeTabBar]?.amenities[index]}
                      // onChange={(e) => formik.setFieldValue(`%${[activeTabBar]}.amenities[${index}].checked`, e.target.checked)}
                      onChange={(e) =>
                        formik.setFieldValue(
                          `luxuryRoom.amenities[${index}].checked`,
                          e.target.checked
                        )
                      }
                      name={`luxuryRoom.amenities[${index}].checked`}
                      // checked={formik.values?.standardRoom?.amenities[index]}
                      checked={amenity.checked}
                      variant="grey"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Drag and Drop Components Wrapper */}
            <div className={styles.dragDropWrapper}>
              <div className={styles.dragDropLabelBox}>
                <CustomLabel
                  labelText={"Upload Room Photo (min: 3 img)"}
                  required={true}
                  htmlFor={"dragDropBox"}
                />
                {/* <span onClick={handleAddClick}><p>Add more</p></span> */}
              </div>

              <FileUpload
                onFilesChange={handleFilesChange}
                accept={".png,.jpg,.JPEG"}
              />
              <FilesList
                files={formik.values.luxuryRoom.files}
                fileProgress={fileProgress.luxuryRoom}
                removeFile={removeFile}
                minRequiredFiles={3}
              />

              <div className={styles.dragDropBox}>
                {/* Drag and Drop Components */}
                {/* Add your drag and drop components here */}
                {/* Dynamically render CustomDragAndDrop components */}
              </div>
            </div>
          </div>
        )}
      </div>
      {formError?.error ? (
        <div className={styles.formsErrorBox}>
          {formError?.error && (
            <p className={styles.error}>{`${formError?.error}`}</p>
          )}
        </div>
      ) : (
        (formError?.standardError || formError?.luxuryError) && (
          <div className={styles.formsErrorBox}>
            {formError?.standardError && (
              <p
                className={styles.error}
              >{`Standard Rooms Form: ${formError?.standardError}`}</p>
            )}
            {formError?.luxuryError && (
              <p
                className={styles.error}
              >{`Luxury Rooms Form: ${formError?.luxuryError}`}</p>
            )}
          </div>
        )
      )}

      {activeTabBar === "luxuryRoom" && (
        <div className={styles.formSubmitBtn}>
          <CustomButton
            buttonText={
              formik.values.luxuryRoom._id
                ? "Update and Continue"
                : "Save and Continue"
            }
            type={"submit"}
            buttonSize={"medium"}
          />
        </div>
      )}
    </form>
  );
};

export default HotelRoomsForm;
