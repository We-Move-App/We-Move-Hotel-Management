import React, { useEffect, useState } from 'react'
import styles from './wallet.module.css'
import DebitCard from '../../components/DebitCard/DebitCard'
import CustomTabBar from '../../components/reusable/custom/CTabbar/CustomTabBar'
import CustomTable from '../../components/Table/CustomTable'
import SearchBar from '../../components/SearchBar/SearchBar'
import TableHeader from '../../components/Table/TableHeader'
import FormHeader from '../../components/reusable/custom/FormHeader/FormHeader'
import GlobalStyles from '../../utils/GlobalStyles'
import CustomInput from '../../components/reusable/custom/Form-Fields/CInput/CustomInput'
import CustomButton from '../../components/reusable/custom/CButton/CustomButton'
import CustomFileInput from '../../components/reusable/custom/Form-Fields/CFileInput/CustomFileInput'
import images from '../../assets/images'
import { LuFileDown } from "react-icons/lu";
import CustomModal from '../../components/reusable/custom/CModal/CustomModal'
import CustomLabel from '../../components/reusable/custom/CLabel/CustomLabel'
import { Weight } from 'lucide-react'
import CustomRadioButton from '../../components/reusable/custom/Form-Fields/CRadioButton/CustomRadioButton'
import { ENDPOINTS } from '../../utils/apiEndpoints'
import apiCall from '../../hooks/apiCall'
import { tokenFromLocalStorage } from '../../utils/helperFunctions'

const Wallet = () => {
    // const token = tokenFromLocalStorage();
    const [tabBarData, setTabBarData] = useState([{ name: 'Transaction History', status: true }, { name: 'Bank Details', styles: false }])
    const [searchQuery, setSearchQuery] = useState('');
    const [bankDetails, setBankDetails] = useState({
        bankName: '',
        bankAccountNumber: '',
        accountHolderName: '',
        bankDetails: null
    })
    // const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCongratulationModalOpen, setIsCongratulationModalOpen] = useState(false);

    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);
    const handleOpenCongratulationModal = () => setIsCongratulationModalOpen(true);
    const handleCloseCongratulationModal = () => setIsCongratulationModalOpen(false);


    const [amount, setAmount] = useState('');
    const walletBalance = 1000; // Example balance, replace with actual balance

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Withdrawal amount:', amount);

        setTimeout(() => {
            setIsModalOpen(false);
            handleOpenCongratulationModal();
        }, 1 * 1000);
    };

    const firstModal = () => {
        // Withdraw Amount Modal
        return (
            <CustomModal onClose={handleCloseModal} isOpen={isModalOpen}>
                <form className={styles.withdrawModal} onSubmit={handleSubmit}>
                    <div className={styles.formContent}>
                        <CustomInput label={'Withdraw Amount'} required={true} type='number' value={amount} onChange={(e) => setAmount(e.target.value)} />

                        <div className={styles.walletSection}>
                            <CustomLabel labelText={'Your Wallet'} />
                            {/* <div className={styles.wallet_option}>
                                <input type="radio" id="withdrawAll" name="wallet" defaultChecked={false} />
                                <label htmlFor="withdrawAll">Withdraw All</label>
                            </div> */}
                            <div>
                                <CustomRadioButton id={1} label={'Withdraw All'} />
                                <p className={styles.wallet_balance}>Balance: ${walletBalance.toFixed(2)}XAF</p>
                            </div>
                        </div>

                        <div className={styles.btnWrapper}>
                            <CustomButton buttonText={'Withdraw'} buttonSize={'medium'} />
                        </div>
                    </div>
                </form>
            </CustomModal>
        )
    }


    const secondModal = () => {
        // Congratulations Modal
        return (
            <CustomModal isOpen={isCongratulationModalOpen} onClose={handleCloseCongratulationModal}>
                <div className={styles.withdrawModal} >
                    <div className={styles.modalFlexBox}>
                        <div className={styles.modalImageWrapper}>
                            <img src={images.congratulationSuccessIcon} alt="congratulation image" />
                        </div>
                        <div className={styles.modalBody}>
                            <p className={styles.modalBoldText}>Congratulations! Successfully done.</p>
                            <p>We are thrilled to extend a warm welcome to all newcomers and returning members alike.</p>
                        </div>
                    </div>
                </div>
            </CustomModal>
        )
    }


    const fetchUserBank = async () => {
        const { data, statusCode, error, success } = await apiCall(ENDPOINTS.HOTEL_BANK_DETAILS, 'GET', {
            // headers: {
            //     Authorization: `Bearer ${token}`
            // }
        });

        if (success && statusCode === 200) {
            const { bankName, accountHolderName, accountNumber, _id, bankDocs } = data?.data?.bank;
            console.log("bank Data :", data)
            setBankDetails({
                bankName,
                bankAccountNumber: accountNumber,
                accountHolderName,
                bankDetails: bankDocs
            })
            // formik.setValues({
            //     bankName: bankName || '',
            //     accountHolderName: accountHolderName || '',
            //     bankAccountNumber: accountNumber || '',
            //     bankDocs: null // or fetched file data if available
            // });
            // setBankId(_id); 
            // setLoading(false);

        }
    }

    useEffect(() => {
        fetchUserBank();
    }, [])

    return (
        <div className={styles.wallet}>
            <h1>Wallet</h1>
            <div className={styles.digitalWalletWrapper}>
                <DebitCard showAmount={true} amount={'12,000'} />
            </div>
            <div className={styles.transactionHistoryAndBankDetialsContianer}>
                <CustomTabBar tabBarData={tabBarData} setTabBarData={setTabBarData} />

                {
                    tabBarData[0].status && (
                        <div className={styles.transactionTable}>
                            {/* <div className={styles.tableHeaderBox}>
                                <div className={styles.title}>Transaction History</div>
                                <SearchBar onSearch={(searchQuery) => { console.log(searchQuery) }} />
                            </div> */}
                            {/* <TableHeader /> */}
                            <div>
                                <SearchBar onSearch={(searchQuery) => { console.log(searchQuery) }} />
                            </div>
                            <CustomTable columns={[
                                { Header: 'Transaction ID', accessor: 'transactionId' },
                                { Header: 'User Name', accessor: 'userName' },
                                { Header: 'Date', accessor: 'date' },
                                { Header: 'Time', accessor: 'time' },
                                { Header: 'Amount', accessor: 'amount' },
                                { Header: 'Available Balance', accessor: 'availableBalance' },
                            ]}
                                data={[
                                    { transactionId: 'OL6768057', userName: 'Harry Potter', date: '11-03-2024', time: '01.30 PM', amount: 89988998, availableBalance: '34,457' },
                                    { transactionId: 'OL6768057', userName: 'Jane Smith', date: '21-03-2024', time: '10.30 PM', amount: 89988998, availableBalance: '34,457' },
                                    { transactionId: 'OL6768057', userName: 'Dr. Banner', date: '22-03-2024', time: '11.30 PM', amount: 89988998, availableBalance: '34,457' },
                                    { transactionId: 'OL6768057', userName: 'John Wick', date: '22-03-2024', time: '10.30 PM', amount: 89988998, availableBalance: '34,457' },
                                    { transactionId: 'OL6768057', userName: 'Tony Stark', date: '24-03-2024', time: '11.30 PM', amount: 89988998, availableBalance: '34,457' },
                                    { transactionId: 'OL6768057', userName: 'Scarlet Witch', date: '24-03-2024', time: '11.30 PM', amount: 89988998, availableBalance: '34,457' },
                                ]}
                                customRowClass="customRow"
                                customCellClass="customCell"
                            />
                        </div>
                    )
                }
                {
                    tabBarData[1].status && (
                        <div className={styles.formHeaderAndFormContainer}>
                            {
                                isModalOpen && firstModal()
                            }
                            {
                                isCongratulationModalOpen && secondModal()
                            }
                            {/* <FormHeader
                                heading={'Bank Details'}
                                headingStyle={{ textAlign: 'left', fontSize: GlobalStyles.fontSizeExtraSmall, fontWeight: GlobalStyles.fontWeightBold }}
                            /> */}
                            <div className={styles.form}>
                                <div className={styles.formFieldsContainer}>
                                    <div className={styles.doubleFormFieldsBox}>
                                        <CustomInput
                                            required={true}
                                            label={'Bank name'}
                                            name='bankName'
                                            value={bankDetails.bankName}
                                            onChange={() => { }}
                                            isDisabled={true}
                                            boxStyle={{ width: '45%', }}

                                        />
                                        <CustomInput
                                            required={true}
                                            label={'Bank Account Number'}
                                            name='bankAccountNumber'
                                            value={bankDetails.bankAccountNumber}
                                            onChange={() => { }}
                                            isDisabled={true}
                                            boxStyle={{ width: '45%' }}

                                        />
                                    </div>
                                    <div className={styles.doubleFormFieldsBox}>
                                        <CustomInput
                                            required={true}
                                            label={'Account Holder Name'}
                                            name='bankName'
                                            value={bankDetails.accountHolderName}
                                            onChange={() => { }}
                                            isDisabled={true}
                                            boxStyle={{ width: '45%' }}

                                        />
                                        <div className={styles.customFileInput}>
                                            <CustomFileInput
                                                label={'Bank Account Details'}
                                                name='bankAccountDetails'
                                                icon={<LuFileDown />}
                                                placeholder={'View file'}
                                            // boxStyle={{width: '45%'}}
                                            />
                                        </div>

                                    </div>
                                </div>

                            </div>
                            <div className={styles.withdrawBtn}>
                                <CustomButton
                                    type={'button'}
                                    onClick={handleOpenModal}
                                    buttonText={'Withdraw'}
                                    buttonSize={'medium'}
                                // style={{ width: '250px', height: '70px' }}
                                />
                            </div>
                        </div>
                    )
                }

            </div>
        </div>
    )
}

export default Wallet