import React, { useState } from 'react'
import styles from './personal-details.module.css';
import CustomButton from '../../reusable/custom/CButton/CustomButton';
import CustomFileInput from '../../reusable/custom/Form-Fields/CFileInput/CustomFileInput';
import FormHeader from '../../reusable/custom/FormHeader/FormHeader';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import useNavigation from '../../../hooks/useNavigation';
import CustomInput from '../../reusable/custom/Form-Fields/CInput/CustomInput';
import ResponsiveDatePickers from '../../reusable/DateInput/DateInput';
import CustomDatePicker from '../../reusable/custom/Form-Fields/CustomDatePicker/CustomDatePicker';
import CustomLabel from '../../reusable/custom/CLabel/CustomLabel';
import { FileUpload } from '../../reusable/custom/Form-Fields/CDragAndDrop/CustomDragAndDrop';
import FilesList from '../../reusable/FilesList/FilesList';
import DateField from '../../reusable/custom/Form-Fields/DateField/DateField';


const FILE_SIZE_LIMIT = 2 * 1024 * 1024; // 2MB
const SUPPORTED_FORMATS = ['application/pdf'];

const PersonalDetailSchema = Yup.object().shape({
    fullName: Yup.string()
        .matches(/^[a-zA-Z\s]*$/, 'Full Name should only contain alphabets and spaces') // Only alphabets and spaces
        .test('noSpaceAtStart', 'The first character cannot be a space', (value) => value?.trim().charAt(0) !== ' ') // No space at the start
        .required('Full Name is required'),

    dateOfBirth: Yup.date()
        .required("Date of Birth is required")
        .max(new Date(), "Date of Birth cannot be in the future"),

    nationalIdExpiry: Yup.date()
        .required("National ID Expiry is required")
        .min(new Date(), "Expiry date cannot be in the past"),

    files: Yup.array()
        .of(
            Yup.mixed()
                .required('A file is required')
                .test(
                    'fileSize',
                    ({ value, path }) => `${path} is too large, must be less than 5MB`,
                    value => value && value.size <= FILE_SIZE_LIMIT
                )
                .test(
                    'fileFormat',
                    ({ value, path }) => `${path} has unsupported format, only JPG, PNG, and PDF are allowed`,
                    value => value && SUPPORTED_FORMATS.includes(value.type)
                )
        )
        .min(2, 'At least two file is required'),

});

const PersonalDetails = () => {
    const { goTo } = useNavigation();
    const [fileProgress, setFileProgress] = useState({});

    const formik = useFormik({
        initialValues: {
            fullName: "",
            dateOfBirth: "",
            nationalIdExpiry: "",
            files: [],
        },
        validationSchema: PersonalDetailSchema,

        onSubmit: async (values) => {
            console.log('Form submitted', values);
            if (Object.keys(formik.errors).length === 0) {
                console.log('Form submitted successfully', values);
                try {
                    const payloadBody = new FormData();
                    payloadBody.append('fullName', values.fullName);

                    // payloadBody.append('ifscCode', 'SBIN0005678');
                    // payloadBody.append('bankAccountDetails', values.bankAccountDetails);

                    // const { data, statusCode, error, success } = await apiCall(ENDPOINTS.HOTEL_BANK_DETAILS, 'POST', {
                    //     body: payloadBody,
                    //     headers: {
                    //         'Content-Type': 'multipart/form-data',
                    //         Authorization: `Bearer ${JSON.parse(localStorage.getItem('WEMOVE_TOKEN')).accessToken}`
                    //     }
                    // });
                    // if (statusCode === 200 && success) {
                    //     console.log(data);
                    //     goTo('/hotel-registration')
                    // }
                } catch (err) {
                    console.error('Error during API call:', err);
                }
            } else {
                console.log('Form has errors:', formik.errors);
            }
            // If successfully submitted
            // goTo('/hotel-registration')
        },
    })

    const handleFilesChange = (newFiles) => {

        const currentFiles = formik.values.files;
        // if (currentFiles && currentFiles.length < 1) {
        formik.setFieldValue('files', [...currentFiles, ...newFiles]);
        // Simulate upload progress for new files
        newFiles.forEach(file => {
            simulateUpload(file);
        });
        // }

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
    // console.log(formik.values)
    return (
        <div className={styles.formContainer}>
            <FormHeader
                heading={'Add Personal Details'}
                subheading={'Welcome to We Move All! Please add your personal details.'}
            />

            <form onSubmit={formik.handleSubmit} className={styles.form} >

                {/* Add your form fields here */}
                <div className={styles.formFieldsContainer}>
                    <CustomInput
                        label={'Full Name'}
                        required={true}
                        name='fullName'
                        value={formik.values.fullName}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        touched={formik.touched.fullName}
                        error={formik.errors.fullName}
                    // error={formik.touched.fullName && formik.errors.fullName}
                    />
                    <div className={styles.dateFieldBox}>
                        <CustomLabel labelText={'Date of Birth'} required={true} />
                        <div className={styles.dateInputWrapper} >
                            <CustomDatePicker onChange={(date) => formik.setFieldValue('dateOfBirth', date)} />
                        </div>
                    </div>

                    {/* <CustomInput
                        label={'National Id'}
                        required={true}
                        name='nationalId'
                        value={formik.values.nationalId}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        touched={formik.touched.nationalId}
                        error={formik.errors.nationalId}
                    // error={formik.touched.nationalId && formik.errors.nationalId}
                    /> */}

                    <DateField labelText={'Date Of Birth'} required={true} />

                    {/* <div className={styles.dateFieldBox}>
                        <CustomLabel labelText={'National Id expiry '} required={true} />
                        <div className={styles.dateInputWrapper} >
                            <DateField/>
                            <CustomDatePicker onChange={(date) => formik.setFieldValue('nationalIdExpiry', date)} />
                        </div>
                    </div> */}

                    {/* Drag and Drop Components Wrapper */}
                    <div className={styles.dragDropWrapper}>
                        {/* <div className={styles.dragDropLabelBox}>
                            <label htmlFor="customdragDrop"><p>Upload Personal Document</p></label>
                        </div> */}
                        <CustomLabel labelText={'Upload Personal Document min(2)'} required={true} />

                        <FileUpload onFilesChange={handleFilesChange} accept={'.pdf'} />
                        {
                            formik.values.files && (<FilesList files={formik.values.files} fileProgress={fileProgress} removeFile={removeFile} />)
                        }
                    </div>
                </div>


                <div className={styles.formSubmitBtn}>
                    {/* Submit Button */}
                    <CustomButton
                        buttonText={'Continue'}
                        type={'submit'}
                        style={{ height: '70px' }}
                    />
                    {/* <div className={styles.skipBox} >
                        <p>OR</p>
                        <p onClick={() => goTo('/hotel-registration')} >Skip</p>
                    </div> */}
                </div>


            </form>

        </div>
    )
}

export default PersonalDetails