import React, { useEffect, useState } from "react";
import styles from "./wallet.module.css";
import DebitCard from "../../components/DebitCard/DebitCard";
import CustomTabBar from "../../components/reusable/custom/CTabbar/CustomTabBar";
import CustomTable from "../../components/Table/CustomTable";
import SearchBar from "../../components/SearchBar/SearchBar";
import TableHeader from "../../components/Table/TableHeader";
import FormHeader from "../../components/reusable/custom/FormHeader/FormHeader";
import GlobalStyles from "../../utils/GlobalStyles";
import CustomInput from "../../components/reusable/custom/Form-Fields/CInput/CustomInput";
import CustomButton from "../../components/reusable/custom/CButton/CustomButton";
import CustomFileInput from "../../components/reusable/custom/Form-Fields/CFileInput/CustomFileInput";
import images from "../../assets/images";
import { LuFileDown } from "react-icons/lu";
import CustomModal from "../../components/reusable/custom/CModal/CustomModal";
import CustomLabel from "../../components/reusable/custom/CLabel/CustomLabel";
import { Weight } from "lucide-react";
import CustomRadioButton from "../../components/reusable/custom/Form-Fields/CRadioButton/CustomRadioButton";
import { ENDPOINTS } from "../../utils/apiEndpoints";
import apiCall from "../../hooks/apiCall";
import { tokenFromLocalStorage } from "../../utils/helperFunctions";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Wallet = () => {
  const navigate = useNavigate();
  // const token = tokenFromLocalStorage();
  const [tabBarData, setTabBarData] = useState([
    { name: "Transaction History", status: true },
    { name: "Withdraw", status: false },
  ]);
  const [searchQuery, setSearchQuery] = useState("");
  const [bankDetails, setBankDetails] = useState({
    bankName: "",
    bankAccountNumber: "",
    accountHolderName: "",
    bankDetails: null,
  });
  // const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCongratulationModalOpen, setIsCongratulationModalOpen] =
    useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const setActiveTab = (indexToActivate) => {
    setTabBarData((prev) =>
      prev.map((tab, index) => ({
        ...tab,
        status: index === indexToActivate,
      }))
    );
  };
  const handleOpenCongratulationModal = () =>
    setIsCongratulationModalOpen(true);
  const handleCloseCongratulationModal = () => {
    setIsCongratulationModalOpen(false);
    setTimeout(() => {
      setActiveTab(0);
      navigate("/dashboard/wallet"); // if you have a route for transaction details
    }, 300);
  };

  const [amount, setAmount] = useState("");
  const walletBalance = 1000;
  const [transactions, setTransactions] = useState([]);

  const formattedTransactions = transactions.map((tx) => {
    const date = new Date(tx.createdAt);

    return {
      transactionId: `${tx.transactionId?.slice(
        0,
        6
      )}...${tx.transactionId?.slice(-4)}`,
      userName: "N/A", // Replace if you have user data
      date: date.toLocaleDateString(), // e.g., "06/08/2025"
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), // e.g., "12:15 PM"
      amount: tx.amount,
      status: tx.type, // No such field in your API
    };
  });

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   console.log("Withdrawal amount:", amount);

  //   setTimeout(() => {
  //     setIsModalOpen(false);
  //     handleOpenCongratulationModal();
  //   }, 1 * 1000);
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = tokenFromLocalStorage();
    const withdrawAmount = Number(amount);

    if (!withdrawAmount || withdrawAmount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/v1/momo/withdraw`,
        {
          amount: withdrawAmount,
          entity: "hotelManager", // adjust based on backend requirement
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("✅ Withdraw success:", res.data);

      setIsModalOpen(false);
      setAmount(""); // clear input
      handleOpenCongratulationModal(); // show second modal
      fetchTransactions(); // refresh transaction list
    } catch (err) {
      console.error("❌ Withdraw failed:", err);
      alert("Withdraw failed. Please try again.");
    }
  };

  const firstModal = () => {
    // Withdraw Amount Modal
    return (
      <CustomModal onClose={handleCloseModal} isOpen={isModalOpen}>
        <form className={styles.withdrawModal} onSubmit={handleSubmit}>
          <div className={styles.formContent}>
            <CustomInput
              label={"Withdraw Amount"}
              required={true}
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            {/* <div className={styles.walletSection}>
              <CustomLabel labelText={"Your Wallet"} />
              <div>
                <CustomRadioButton id={1} label={"Withdraw All"} />
                <p className={styles.wallet_balance}>
                  Balance: ${walletBalance.toFixed(2)}XAF
                </p>
              </div>
            </div> */}

            <div className={styles.btnWrapper}>
              <CustomButton buttonText={"Withdraw"} buttonSize={"medium"} />
            </div>
          </div>
        </form>
      </CustomModal>
    );
  };

  const secondModal = () => {
    // Congratulations Modal
    return (
      <CustomModal
        isOpen={isCongratulationModalOpen}
        onClose={handleCloseCongratulationModal}
      >
        <div className={styles.withdrawModal}>
          <div className={styles.modalFlexBox}>
            <div className={styles.modalImageWrapper}>
              <img
                src={images.congratulationSuccessIcon}
                alt="congratulation image"
              />
            </div>
            <div className={styles.modalBody}>
              <p className={styles.modalBoldText}>
                Congratulations! Successfully done.
              </p>
              <p>
                We are thrilled to extend a warm welcome to all newcomers and
                returning members alike.
              </p>
            </div>
          </div>
        </div>
      </CustomModal>
    );
  };

  const fetchUserBank = async () => {
    const { data, statusCode, error, success } = await apiCall(
      ENDPOINTS.HOTEL_BANK_DETAILS,
      "GET",
      {
        // headers: {
        //     Authorization: `Bearer ${token}`
        // }
      }
    );

    if (success && statusCode === 200) {
      const { bankName, accountHolderName, accountNumber, _id, bankDocs } =
        data?.data?.bank;
      console.log("bank Data :", data);
      setBankDetails({
        bankName,
        bankAccountNumber: accountNumber,
        accountHolderName,
        bankDetails: bankDocs,
      });
      // formik.setValues({
      //     bankName: bankName || '',
      //     accountHolderName: accountHolderName || '',
      //     bankAccountNumber: accountNumber || '',
      //     bankDocs: null // or fetched file data if available
      // });
      // setBankId(_id);
      // setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const token = tokenFromLocalStorage();

      const res = await axios.get(
        `${
          import.meta.env.VITE_BASE_URL
        }/api/v1/wallet/transactions?entity=hotelManager`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Transaction Data:", res.data);
      setTransactions(res.data.data.transactions || []);
      // You can update state here with res.data if needed
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  useEffect(() => {
    fetchUserBank();
    fetchTransactions();
  }, []);

  useEffect(() => {
    const withdrawTab = tabBarData.find((tab) => tab.name === "Withdraw");
    if (withdrawTab?.status) {
      setIsModalOpen(true);
    } else {
      setIsModalOpen(false);
    }
  }, [tabBarData]);

  return (
    <div className={styles.wallet}>
      <h1>Wallet</h1>
      <div className={styles.digitalWalletWrapper}>
        <DebitCard showAmount={true} />
      </div>
      <div className={styles.transactionHistoryAndBankDetialsContianer}>
        <CustomTabBar
          tabBarData={tabBarData}
          setTabBarData={setTabBarData}
          activeTabIndex={tabBarData.findIndex((tab) => tab.status)}
        />

        {tabBarData[0].status && (
          <div className={styles.transactionTable}>
            {/* <div className={styles.tableHeaderBox}>
                                <div className={styles.title}>Transaction History</div>
                                <SearchBar onSearch={(searchQuery) => { console.log(searchQuery) }} />
                            </div> */}
            {/* <TableHeader /> */}
            <div>
              <SearchBar
                onSearch={(searchQuery) => {
                  console.log(searchQuery);
                }}
              />
            </div>
            <CustomTable
              columns={[
                { Header: "Transaction ID", accessor: "transactionId" },
                // { Header: "User Name", accessor: "userName" },
                { Header: "Date", accessor: "date" },
                { Header: "Time", accessor: "time" },
                { Header: "Amount", accessor: "amount" },
                { Header: "Status", accessor: "status" },
              ]}
              data={formattedTransactions}
              customRowClass="customRow"
              customCellClass="customCell"
            />
          </div>
        )}

        {tabBarData[1].status && <>{isModalOpen && firstModal()}</>}
        {isCongratulationModalOpen && secondModal()}
      </div>
    </div>
  );
};

export default Wallet;
