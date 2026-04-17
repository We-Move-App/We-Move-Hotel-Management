import { useCallback, useEffect, useState } from "react";
import styles from "./wallet.module.css";
import DebitCard from "../../components/DebitCard/DebitCard";
import CustomTabBar from "../../components/reusable/custom/CTabbar/CustomTabBar";
import CustomTable from "../../components/Table/CustomTable";
import SearchBar from "../../components/SearchBar/SearchBar";
import CustomInput from "../../components/reusable/custom/Form-Fields/CInput/CustomInput";
import CustomButton from "../../components/reusable/custom/CButton/CustomButton";
import CustomModal from "../../components/reusable/custom/CModal/CustomModal";
import images from "../../assets/images";
import { ENDPOINTS } from "../../utils/apiEndpoints";
import apiCall from "../../hooks/apiCall";
import { tokenFromLocalStorage } from "../../utils/helperFunctions";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Wallet = () => {
  const { t } = useTranslation("wallet");

  const navigate = useNavigate();
  const [tabBarData, setTabBarData] = useState([
    { name: "tabs.transactions", status: true, key: "transactions" },
    { name: "tabs.withdraw", status: false, key: "withdraw" },
  ]);

  const [bankDetails, setBankDetails] = useState({
    bankName: "",
    bankAccountNumber: "",
    accountHolderName: "",
    bankDetails: null,
  });

  const [formattedTransactions, setFormattedTransactions] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 10,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchTransactions = useCallback(
    async (page = 1, limit = 10, search = "") => {
      try {
        if (typeof page === "string") {
          const digitsOnly = /^\d+$/.test(page);
          if (digitsOnly) page = Number.parseInt(page, 10);
          else {
            console.warn(
              "[fetchTransactions] first arg non-numeric -> treating as search:",
              page,
            );
            search = page;
            page = 1;
          }
        }
        page = Number.isFinite(+page) ? Number(page) : 1;
        limit = Number.isFinite(+limit) ? Number(limit) : 10;
        search = typeof search === "string" ? search : "";

        setLoading(true);
        const token = tokenFromLocalStorage();
        // console.debug("[fetchTransactions] REQUEST params:", {
        //   entity: "hotelManager",
        //   page,
        //   limit,
        //   search: search || null,
        // });

        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/v1/wallet/transactions`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: {
              entity: "hotelManager",
              page,
              limit,
              ...(search ? { search } : {}),
            },
          },
        );

        // console.debug("[fetchTransactions] RESPONSE raw ->", res?.data);
        const paginationData = res?.data?.data?.pagination;
        if (paginationData) {
          const pagesNum = Number(paginationData.pages) || 1;
          const pageNum = Number(paginationData.page) || 1;
          const totalNum = Number(paginationData.total) || 0;
          const limitNum = Number(paginationData.limit) || limit;

          // console.debug("[fetchTransactions] server pagination ->", {
          //   page: pageNum,
          //   pages: pagesNum,
          //   total: totalNum,
          //   limit: limitNum,
          // });

          setPagination({
            page: pageNum,
            pages: pagesNum,
            total: totalNum,
            limit: limitNum,
          });
        } else {
          console.warn(
            "[fetchTransactions] response missing pagination object",
          );
        }
        const inner = res?.data?.data;
        let rawArray = [];
        if (!inner) rawArray = [];
        else if (Array.isArray(inner.transactions))
          rawArray = inner.transactions;
        else if (Array.isArray(inner)) rawArray = inner;
        else if (typeof inner === "object") rawArray = [inner];
        else rawArray = [];

        setTransactions(rawArray);

        const formatted = rawArray.map((t, idx) => {
          const createdAt = t.createdAt || t.created_at;
          const dt = createdAt ? new Date(createdAt) : null;
          return {
            id: t.transactionId || t._id || idx,
            transactionId: t.transactionId || t._id || "",
            date: dt ? dt.toLocaleDateString() : "",
            time: dt
              ? dt.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "",
            amount: t.amount ?? t.amountPaid ?? "",
            status: t.status ?? t.state ?? "",
            __raw: t,
          };
        });

        setFormattedTransactions(formatted);
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setTransactions([]);
        setFormattedTransactions([]);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchTransactions(1, pagination.limit, searchQuery);
  }, []);

  const handlePageChange = (page) => {
    const p = Number(page) || 1;
    console.debug(
      "[handlePageChange] clicked page ->",
      p,
      "current search:",
      searchQuery,
    );
    fetchTransactions(p, pagination.limit, searchQuery);
  };

  const handleSearchSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    fetchTransactions(1, pagination.limit, searchQuery);
  };

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
      })),
    );
  };
  const handleOpenCongratulationModal = () =>
    setIsCongratulationModalOpen(true);
  const handleCloseCongratulationModal = () => {
    setIsCongratulationModalOpen(false);
    window.location.reload();
    setTimeout(() => {
      setActiveTab(0);
      navigate("/dashboard/wallet");
    }, 300);
  };

  const [amount, setAmount] = useState("");
  const [transactions, setTransactions] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = tokenFromLocalStorage();
    const withdrawAmount = Number(amount);

    if (!withdrawAmount || withdrawAmount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/v1/momo/withdraw`,
        {
          amount: withdrawAmount,
          entity: "hotelManager",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // console.log("Withdraw success:", res.data);

      setIsModalOpen(false);
      // setAmount("");
      handleOpenCongratulationModal();
      fetchTransactions();
    } catch (err) {
      alert("Withdraw failed. Please try again.");
      throw new Error(err.response.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const firstModal = () => {
    // Withdraw Amount Modal
    return (
      <CustomModal onClose={handleCloseModal} isOpen={isModalOpen}>
        <form className={styles.withdrawModal} onSubmit={handleSubmit}>
          <div className={styles.formContent}>
            <CustomInput
              label={t("withdrawModal.amount")}
              required={true}
              floatNumber={true}
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            <div className={styles.btnWrapper}>
              <CustomButton
                buttonText={
                  loading
                    ? t("withdrawModal.processing")
                    : t("withdrawModal.withdraw")
                }
                buttonSize={"medium"}
                type="submit"
              />
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
              <p className={styles.modalBoldText}>{t("successModal.title")}</p>
              <p>{t("successModal.description")}</p>
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
    );

    if (success && statusCode === 200 && data.data.bank) {
      const { bankName, accountHolderName, accountNumber, _id, bankDocs } =
        data.data.bank;
      setBankDetails({
        bankName,
        bankAccountNumber: accountNumber,
        accountHolderName,
        bankDetails: bankDocs,
      });
    }
  };

  useEffect(() => {
    const withdrawTab = tabBarData.find((tab) => tab.key === "withdraw");

    if (withdrawTab?.status) {
      setIsModalOpen(true);
    } else {
      setIsModalOpen(false);
    }
  }, [tabBarData]);

  return (
    <div className={styles.wallet}>
      <h1>{t("heading")}</h1>
      <div className={styles.digitalWalletWrapper}>
        <DebitCard showAmount={true} />
      </div>
      <div className={styles.transactionHistoryAndBankDetialsContianer}>
        <CustomTabBar
          tabBarData={tabBarData}
          setTabBarData={setTabBarData}
          activeTabIndex={tabBarData.findIndex((tab) => tab.status)}
          t={t}
        />

        {tabBarData[0].status && (
          <div className={styles.transactionTable}>
            <div>
              <SearchBar onSearch={(q) => fetchTransactions(q)} />
            </div>
            <CustomTable
              columns={[
                { Header: t("table.transactionId"), accessor: "transactionId" },
                // { Header: "User Name", accessor: "userName" },
                { Header: t("table.date"), accessor: "date" },
                { Header: t("table.time"), accessor: "time" },
                { Header: t("table.amount"), accessor: "amount" },
                { Header: t("table.status"), accessor: "status" },
              ]}
              data={formattedTransactions}
              customRowClass="customRow"
              customCellClass="customCell"
              currentPage={pagination.page}
              totalPages={pagination.pages}
              onPageChange={handlePageChange}
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
