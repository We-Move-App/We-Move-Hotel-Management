import React, { useState } from 'react'
import styles from './add-customer.module.css';
import CustomInput from '../../components/reusable/custom/Form-Fields/CInput/CustomInput';
import CustomButton from '../../components/reusable/custom/CButton/CustomButton';
import DragDrop from '../../components/reusable/custom/D&DFileUpload/DragDrop';
import CustomDatePicker from '../../components/reusable/custom/Form-Fields/CustomDatePicker/CustomDatePicker';
import CustomSelect from '../../components/reusable/custom/CSelect/CustomSelect';
import CustomLabel from '../../components/reusable/custom/CLabel/CustomLabel';
import SelectInput from '../../components/reusable/custom/CSelect/SelectInput';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FileUpload } from '../../components/reusable/custom/Form-Fields/CDragAndDrop/CustomDragAndDrop';
import FilesList from '../../components/reusable/FilesList/FilesList';
import apiCall from '../../hooks/apiCall';
import { ENDPOINTS } from '../../utils/apiEndpoints';

// Constants (reuse your supported formats & size limit)
const FILE_SIZE_LIMIT = 5 * 1024 * 1024; // 5 MB
const SUPPORTED_FORMATS = ['image/jpg', 'image/jpeg', 'image/png', 'application/pdf'];


const customerValidationSchema = Yup.object().shape({
    customerName: Yup.string()
        .required('Customer Name is required')
        .min(2, 'Customer Name must be at least 2 characters')
        .max(50, 'Customer Name cannot exceed 50 characters'),
    email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
    mobile: Yup.string()
        .required('Mobile number is required')
        .matches(/^[0-9]{10}$/, 'Mobile number must be exactly 10 digits'),

    checkInDate: Yup.date()
        .required('Check-in date is required')
        .typeError('Check-in date is invalid'),

    checkOutDate: Yup.date()
        .required('Check-out date is required')
        .typeError('Check-out date is invalid')
        .min(
            Yup.ref('checkInDate'),
            'Check-out date cannot be before check-in date'
        ),
    isAdult: Yup.string()
        .required('Number of adults is required'),
    files: Yup.array()
        .of(
            Yup.mixed()
                .required('A file is required')
                .test('file-check', 'Invalid file', (value) => {
                    if (value instanceof File) {
                        const validSize = value.size <= FILE_SIZE_LIMIT;
                        const validFormat = SUPPORTED_FORMATS.includes(value.type);
                        return validSize && validFormat;
                    }
                    return true; // Skip validation for existing files
                })
        )
        .test('file-count', 'At least 1 file is required', function (value) {
            const count = value?.length || 0;
            return count >= 1;
        })

})
const AddCustomer = () => {
    const formik = useFormik({
        initialValues: {
            customerName: '',
            email: "",
            mobile: '',
            checkInDate: '',
            checkOutDate: '',
            isAdult: "",
            roomType: '',
            files: []
        },
        validationSchema: customerValidationSchema,
        onSubmit: async (values) => {
            console.log('clicked')
            console.log(values);
            const payloadFormData = new FormData();
            payloadFormData.append("hotelId", values);
            // payloadFormData.append("roomTypeId", values);
            payloadFormData.append("checkInDate", values);
            payloadFormData.append("checkOutDate", values);
            payloadFormData.append("checkInTime", values);
            payloadFormData.append("checkOutTime", values);
            payloadFormData.append("totalAmount", values);
            payloadFormData.append("paymentStatus", values);
            payloadFormData.append("noOfRoom", values);
            payloadFormData.append("roomType", values.roomType);
            // payloadFormData.append("identity_card", values);

            const { customerName, email, mobile, checkInDate, checkOutDate, isAdult, files } = values;
            const user = {
                name: customerName,
                email,
                phoneNumber: mobile,
                isAdult,
            };

            files.forEach((file) => {
                payloadFormData.append("identity_card", file);
            })

            payloadFormData.append("user", user);
            try {
                const { data, statusCode, error, success } = await apiCall(`${ENDPOINTS.ADD_GUEST}`, 'POST', {
                    body: payloadFormData
                });
                if (error) {
                    console.log(error);
                } else if (success && statusCode === 201) {
                    console.log("User added && booking created:", data);
                }
            } catch (error) {
                console.log(error);
            }
        }
    });
    const [fileProgress, setFileProgress] = useState({});

    const [options, setOptions] = useState([
        { label: 'Adult', value: true },
        { label: 'Kid', value: false }
    ])

    const handleFilesChange = (newFiles) => {
        const currentFiles = formik.values.files;
        formik.setFieldValue('files', [...currentFiles, ...newFiles]);
        newFiles.forEach(file => {
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
            setFileProgress(prev => ({
                ...prev,
                [file.name]: Math.min(progress, 100)
            }));
        }, 200);
    };

    const removeFile = (index, fileName) => {
        console.log('removeFile', fileName, index);
        const files = formik.values.files;
        formik.setFieldValue('files', [...files.slice(0, index), ...files.slice(index + 1)]);
        setFileProgress(prev => {
            const { [fileName]: removed, ...rest } = prev;
            return rest;
        });
    }

    const handleCheckInDate = (date) => {
        formik.setFieldValue('checkInDate', date)
    }
    const handleCheckOutDate = (date) => {
        formik.setFieldValue('checkOutDate', date)
    }

    const handelSelect = () => {
        const value = !formik.values.isAdult
        formik.setFieldValue('isAdult', value)
    }

    return (
        <div className={styles.addCustomer}>
            <p className={styles.breadcrumb}>Booking Management {">"} <span className={styles.lightText}>Add New Customer</span> </p>

            <form className={styles.form} onSubmit={formik.handleSubmit}>
                <div className={styles.formFieldsContainerWrapper}>
                    <p className={styles.title}>Guest Details</p>

                    <div className={styles.formFieldsContainer}>
                        <div className={styles.formLeftBox}>
                            <CustomInput
                                onBlur={formik.handleBlur}
                                onChange={formik.handleChange}
                                label="Customer Name"
                                type="text"
                                name="customerName"
                                required
                                error={formik.errors?.customerName}
                                touched={formik.touched?.customerName}
                            />
                            <CustomInput
                                label="Email Id"
                                type="email"
                                takeSpecialChar={true}
                                name="email"
                                onBlur={formik.handleBlur}
                                onChange={formik.handleChange}
                                required
                                error={formik.errors?.email}
                                touched={formik.touched?.email}
                            />
                            <CustomInput
                                label="Mobile Number"
                                type="number"
                                name="mobile"
                                onBlur={formik.handleBlur}
                                onChange={formik.handleChange}
                                required
                                error={formik.errors?.mobile}
                                touched={formik.touched?.mobile}
                            />
                            <CustomInput
                                label="Room Type"
                                type="text"
                                name="roomType"
                                onBlur={formik.handleBlur}
                                onChange={formik.handleChange}
                                required
                                error={formik.errors?.roomType}
                                touched={formik.touched?.roomType}
                            />
                            <div >
                                {/* <div className={styles.checkInOutTimeAndPersonCount}> */}

                                <div className={styles.multipleInputsContainer}>
                                    <div className={styles.multiInputs}>
                                        <CustomLabel labelText={'Checkin'} />
                                        <div className={styles.customDatePickerBox}>
                                            <CustomDatePicker value={formik.values.checkInDate} onChange={handleCheckInDate} />
                                        </div>
                                    </div>

                                    <div className={styles.multiInputs}>
                                        <CustomLabel labelText={'Checkout'} />
                                        <div className={styles.customDatePickerBox}>
                                            <CustomDatePicker value={formik.values.checkOutDate} onChange={handleCheckOutDate} />
                                        </div>
                                    </div>
                                    <div className={styles.multiInputs}>
                                        <CustomLabel labelText={''} />
                                        <div className={styles.customDatePickerBox}>
                                            {/* <CustomDatePicker /> */}
                                            <SelectInput options={options} value={formik?.values.isAdult} onChange={handelSelect} />
                                        </div>
                                    </div>

                                </div>
                                {
                                    formik.errors?.checkInDate && <div className={styles.error} >{formik.errors?.checkInDate}</div>
                                }
                                {
                                    formik.errors?.checkOutDate && <div className={styles.error} >{formik.errors?.checkOutDate}</div>
                                }
                                {
                                    formik.errors?.isAdult && <div className={styles.error} >{formik.errors?.isAdult}</div>
                                }
                            </div>
                        </div>
                        <div className={styles.formRightBox}>
                            <p className={styles.title}>Add ID Card</p>
                            <FileUpload onFilesChange={handleFilesChange} accept={'.png, .jpg, .JPEG'} />
                            {
                                formik.values.files && (<FilesList files={formik.values.files} fileProgress={fileProgress} removeFile={removeFile} minRequiredFiles={1} />)
                            }
                        </div>
                    </div>
                </div>
                <div className={styles.formSubmitBtn}>
                    <CustomButton
                        type={'submit'}
                        buttonSize={'medium'}
                        buttonText={'Book'}
                    />
                </div>
            </form>
        </div>
    )
}

export default AddCustomer

