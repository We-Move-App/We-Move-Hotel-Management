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
import { tokenFromLocalStorage } from "../../utils/helperFunctions";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast, ToastContainer } from "react-toastify";

const Wallet = () => {
  const { t, i18n } = useTranslation("wallet");

  const navigate = useNavigate();
  const [tabBarData, setTabBarData] = useState([
    { name: "tabs.transactions", status: true, key: "transactions" },
    { name: "tabs.withdraw", status: false, key: "withdraw" },
  ]);

  // const [bankDetails, setBankDetails] = useState({
  //   bankName: "",
  //   bankAccountNumber: "",
  //   accountHolderName: "",
  //   bankDetails: null,
  // });

  const [transactions, setTransactions] = useState([]);
  const [formattedTransactions, setFormattedTransactions] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 10,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCongratulationModalOpen, setIsCongratulationModalOpen] =
    useState(false);
  const [amount, setAmount] = useState("");

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
            headers: {
              Authorization: `Bearer ${token}`,
              ln: i18n.language || "en",
            },
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
    [i18n.language],
  );

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

  // const handleSearchSubmit = (e) => {
  //   if (e && e.preventDefault) e.preventDefault();
  //   fetchTransactions(1, pagination.limit, searchQuery);
  // };

  // const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  // const setActiveTab = (indexToActivate) => {
  //   setTabBarData((prev) =>
  //     prev.map((tab, index) => ({
  //       ...tab,
  //       status: index === indexToActivate,
  //     })),
  //   );
  // };
  const setActiveTab = (indexToActivate) => {
    setTabBarData((prev) => {
      const updated = prev.map((tab, index) => ({
        ...tab,
        status: index === indexToActivate,
      }));
      return [...updated]; // force new reference
    });
  };

  // const handleOpenCongratulationModal = () =>
  //   setIsCongratulationModalOpen(true);

  const handleCloseCongratulationModal = () => {
    setIsCongratulationModalOpen(false);

    // switch tab AFTER closing success modal
    setActiveTab(0);

    // optional refresh
    setTimeout(() => {
      navigate("/dashboard/wallet");
    }, 300);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = tokenFromLocalStorage();
    const withdrawAmount = Number(amount);

    if (!withdrawAmount || withdrawAmount <= 0) {
      toast.error(t("messages.invalidAmount"));
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/v1/momo/withdraw`,
        {
          amount: withdrawAmount,
          entity: "hotelManager",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            ln: i18n.language || "en",
          },
        },
      );

      if (response?.data?.success) {
        // STEP 1: Close withdraw modal
        setIsModalOpen(false);

        // STEP 3: open success modal
        setIsCongratulationModalOpen(true);

        //  STEP 3: Reset amount
        setAmount("");

        //  STEP 4: Fetch data in background (no await)
        fetchTransactions(1, pagination.limit, "");
        toast.success(t("messages.withdrawSuccess"));
      } else {
        toast.error(t("messages.withdrawFailed"));
        console.error(
          "Withdraw API responded with failure:",
          response?.data?.message || response?.data?.error || "Unknown error",
        );
        return;
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        t("messages.withdrawFailed");

      toast.error(msg);
      return;
    } finally {
      setLoading(false);
    }
  };

  // const fetchUserBank = async () => {
  //   const { data, statusCode, error, success } = await apiCall(
  //     ENDPOINTS.HOTEL_BANK_DETAILS,
  //     "GET",
  //   );

  //   if (success && statusCode === 200 && data.data.bank) {
  //     const { bankName, accountHolderName, accountNumber, _id, bankDocs } =
  //       data.data.bank;
  //     setBankDetails({
  //       bankName,
  //       bankAccountNumber: accountNumber,
  //       accountHolderName,
  //       bankDetails: bankDocs,
  //     });
  //   }
  // };

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

  useEffect(() => {
    fetchTransactions(1, pagination.limit, searchQuery);
  }, [i18n.language]);

  useEffect(() => {
    const withdrawTab = tabBarData.find((tab) => tab.key === "withdraw");

    // open only when switching to withdraw tab
    if (withdrawTab?.status) {
      setIsModalOpen(true);
    } else {
      setIsModalOpen(false);
    }
  }, [tabBarData]);

  return (
    <div className={styles.wallet}>
      <ToastContainer position="top-center" closeOnClick autoClose={3000} />
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

        {tabBarData[1].status && isModalOpen && firstModal()}

        {isCongratulationModalOpen && secondModal()}
      </div>
    </div>
  );
};

export default Wallet;
