import React, { useEffect, useState } from 'react'

// Custom Component
import CustomButton from '../../../../reusable/custom/CButton/CustomButton'
import CustomInput from '../../../../reusable/custom/Form-Fields/CInput/CustomInput'

import styles from './hotel-location-form.module.css';
import images from '../../../../../assets/images'

import { useFormik } from 'formik';
import * as Yup from 'yup';
import apiCall from '../../../../../hooks/apiCall';
import { ENDPOINTS } from '../../../../../utils/apiEndpoints';
import GooglePlacesAutocomplete from '../../../../reusable/googlemap/GooglePlacesAutocomplete';

const HotelLocationValidationSchema = Yup.object().shape({
  hotelAddress: Yup.string()
    .required('Hotel Address is required')
    .min(5, 'Hotel Address must be at least 5 characters long')
    .max(500, 'Hotel Address cannot exceed 500 characters'),
  city: Yup.string()
    .required('City is required')
    .min(2, 'City must be at least 2 characters long')
    .max(50, 'City cannot exceed 50 characters'),
  locality: Yup.string()
    .required('Locality is required')
    .min(2, 'Locality must be at least 2 characters long')
    .max(50, 'Locality cannot exceed 50 characters'),
  landmark: Yup.string()
    .min(2, 'Landmark must be at least 2 characters long')
    .max(50, 'Landmark cannot exceed 50 characters'),
  pincode: Yup.string()
    .required('Pincode is required')
    .matches(/^\d{6}$/, 'Pincode must be exactly 6 digits') // Ensures exactly 6 digits
})

const HotelLocationForm = ({ initialValues, onPrev, onNext, setMultipartFormState }) => {
  const [loading, setLoading] = useState(true);

  const formik = useFormik({
    initialValues: initialValues,
    enableReinitialize: true,
    validationSchema: HotelLocationValidationSchema,
    onSubmit: async (values) => {
      try {
        console.log('Hotel Location Form submitted.');
        console.log('Hotel Location Form data:', values);

        const hotelID = localStorage.getItem('WEMOVE_HOTELID') || '';

        // const payloadBody = new FormData();
        // payloadBody.append('hotelAddress', values.hotelAddress);
        // payloadBody.append('city', values.city);
        // payloadBody.append('locality', values.locality);
        // payloadBody.append('landmark', values.landmark);
        // payloadBody.append('pincode', values.pincode);
        // payloadBody.append('hotelId', user?._id);
        const payload = {
          address: values.hotelAddress,
          city: values.city,
          street: values.locality,
          landmark: values.landmark,
          pincode: values.pincode,
          state: values.state || "Karnatakaaww",
          country: values.country || "India",
          hotelId: hotelID,
          latitude: values.latitude,
          longitude: values.longitude
        }

        if (values._id) {
          console.log("hit upload", payload);
          const { data, statusCode, error, success } = await apiCall(`${ENDPOINTS.HOTEL_LOCATION}/${hotelID}`, 'PUT', {
            body: payload, headers: {
              Authorization: `Bearer ${JSON.parse(localStorage.getItem('WEMOVE_TOKEN')).accessToken}`
            }
          });
          if (statusCode === 200 && success) {
            // console.log(data);
            onNext(values);
          }
        } else {
          console.log("hit post", payload);
          const { data, statusCode, error, success } = await apiCall(ENDPOINTS.HOTEL_LOCATION, 'POST', {
            body: payload, headers: {
              // 'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${JSON.parse(localStorage.getItem('WEMOVE_TOKEN')).accessToken}`
            }
          });
          if (statusCode === 201 && success) {
            // console.log(data);
            onNext(values);
          }
        }
      } catch (err) {
        console.error('Error during API call:', err);
      }

      // onNext: Pass data to parent component

    }
  })

  const handleLocation = (locationDetails) => {
    // console.log(locationDetails);
    // setLoading(true);
    const { address, city, locality, landmark, postalCode } = locationDetails;
    // Update Formik values
    formik.setFieldValue('hotelAddress', address);
    formik.setFieldValue('city', city);
    formik.setFieldValue('locality', locality);
    formik.setFieldValue('landmark', landmark);
    formik.setFieldValue('pincode', postalCode);
    setLoading(false);
  }

  useEffect(() => {
    console.log(formik.values)
  }, [loading])

  // const getLocationDetails = async () => {
  //   return new Promise((resolve, reject) => {
  //     if (!navigator.geolocation) {
  //       reject("Geolocation is not supported by this browser.");
  //       return;
  //     }

  //     navigator.geolocation.getCurrentPosition(
  //       async (position) => {
  //         const { latitude, longitude } = position.coords;

  //         try {
  //           const response = await fetch(
  //             `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`
  //           );

  //           const data = await response.json();
  //           const address = data.address;

  //           const locationDetails = {
  //             address: data.display_name,
  //             pincode: address.postcode || '',
  //             locality: address.suburb || address.neighbourhood || '',
  //             city: address.city || address.town || address.village || '',
  //             state: address.state || '',
  //             country: address.country || '',
  //             landmark: address.attraction || address.building || address.amenity || '',
  //           };
  //           console.log(locationDetails)
  //           resolve(locationDetails);
  //         } catch (error) {
  //           reject("Error fetching location details.");
  //         }
  //       },
  //       (error) => {
  //         reject("Location permission denied or unavailable.");
  //       }
  //     );
  //   });
  // };

  // useEffect(()=>{
  //   getLocationDetails()
  // },[])

  return (
    <form className={styles.form} onSubmit={formik.handleSubmit}>
      <div className={styles.formFieldsContainer}>
        <div className={styles.mapBox}>
          <label><p>Add Location</p></label>
          {/* <GoogleMapComponent handleLocation={(locationDetails) => handleLocation(locationDetails)} formik={formik} /> */}
          <GooglePlacesAutocomplete formik={formik} />
        </div>
        {/* 
        <CustomInput
          type="text"
          required={true}
          name="hotelAddress"
          label="Address"
          alphaNumeric={true}
          takeSpecialChar={true}
          value={formik.values.hotelAddress}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.errors?.hotelAddress}
          touched={formik.touched?.hotelAddress}
        /> */}

        <div className={styles.doubleFormFieldsBox}>
          <CustomInput
            required={true}
            name="city"
            label="City"
            value={formik.values.city}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            boxStyle={{ width: '50%' }}
            error={formik.errors?.city}
            touched={formik.touched?.city}
          />
          <CustomInput
            required={true}
            name="locality"
            label="Locality"
            value={formik.values.locality}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            boxStyle={{ width: '50%' }}
            error={formik.errors?.locality}
            touched={formik.touched?.locality}
          />
        </div>

        <div className={styles.doubleFormFieldsBox}>
          <CustomInput
            // required={true}
            name="landmark"
            label="Landmark"
            value={formik.values.landmark}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            boxStyle={{ width: '50%' }}
            error={formik.errors?.landmark}
            touched={formik.touched?.landmark}
          />
          <CustomInput
            required={true}
            name="pincode"
            label="Pincode"
            type='number'
            value={formik.values.pincode}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            boxStyle={{ width: '50%' }}
            error={formik.errors?.pincode}
            touched={formik.touched?.pincode}
          />
        </div>

      </div>

      <div className={styles.formSubmitBtn}>
        <CustomButton buttonText={initialValues._id ? "Update" : 'Continue'} type={'submit'} buttonSize={'medium'} />
      </div>
    </form>
  )
}

export default HotelLocationForm