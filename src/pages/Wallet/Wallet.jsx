import { useCallback, useEffect, useState, useRef } from "react";
import styles from "./wallet.module.css";
import DebitCard from "../../components/DebitCard/DebitCard";
import CustomTabBar from "../../components/reusable/custom/CTabbar/CustomTabBar";
import CustomTable from "../../components/Table/CustomTable";
import SearchBar from "../../components/SearchBar/SearchBar";
import CustomInput from "../../components/reusable/custom/Form-Fields/CInput/CustomInput";
import CustomButton from "../../components/reusable/custom/CButton/CustomButton";
import CustomModal from "../../components/reusable/custom/CModal/CustomModal";
import images from "../../assets/images";
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
  const isSubmittingRef = useRef(false);

  // =========================
  // DEBIT CARD REFRESH KEY
  // =========================
  const [walletRefreshKey, setWalletRefreshKey] = useState(0);

  // =========================
  // FETCH TRANSACTIONS
  // =========================
  const fetchTransactions = useCallback(
    async (page = 1, limit = 10, search = "") => {
      try {
        if (typeof page === "string") {
          const digitsOnly = /^\d+$/.test(page);

          if (digitsOnly) {
            page = Number.parseInt(page, 10);
          } else {
            search = page;
            page = 1;
          }
        }

        page = Number.isFinite(+page) ? Number(page) : 1;
        limit = Number.isFinite(+limit) ? Number(limit) : 10;
        search = typeof search === "string" ? search : "";

        setSearchQuery(search);
        setLoading(true);

        const token = tokenFromLocalStorage();

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
              ...(search ? { transactionId: search } : {}),
            },
          },
        );

        const paginationData = res?.data?.data?.pagination;

        if (paginationData) {
          setPagination({
            page: Number(paginationData.page) || 1,
            pages: Number(paginationData.pages) || 1,
            total: Number(paginationData.total) || 0,
            limit: Number(paginationData.limit) || limit,
          });
        }

        const inner = res?.data?.data;

        let rawArray = [];

        if (!inner) rawArray = [];
        else if (Array.isArray(inner.transactions)) {
          rawArray = inner.transactions;
        } else if (Array.isArray(inner)) {
          rawArray = inner;
        } else if (typeof inner === "object") {
          rawArray = [inner];
        }

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

  // =========================
  // PAGE CHANGE
  // =========================
  const handlePageChange = (page) => {
    const p = Number(page) || 1;

    fetchTransactions(p, pagination.limit, searchQuery);
  };

  // =========================
  // CLOSE MODAL
  // =========================
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // =========================
  // SET ACTIVE TAB
  // =========================
  const setActiveTab = (indexToActivate) => {
    setTabBarData((prev) => {
      const updated = prev.map((tab, index) => ({
        ...tab,
        status: index === indexToActivate,
      }));

      return [...updated];
    });
  };

  // =========================
  // CLOSE SUCCESS MODAL
  // =========================
  const handleCloseCongratulationModal = () => {
    setIsCongratulationModalOpen(false);

    setActiveTab(0);

    setTimeout(() => {
      navigate("/dashboard/wallet");
    }, 300);
  };

  // =========================
  // WITHDRAW SUBMIT
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    // PREVENT MULTIPLE CLICK / API CALL
    if (loading || isSubmittingRef.current) {
      return;
    }

    const token = tokenFromLocalStorage();

    const withdrawAmount = Number(amount);

    if (!withdrawAmount || withdrawAmount <= 0) {
      toast.error(t("messages.invalidAmount"));
      return;
    }

    try {
      isSubmittingRef.current = true;

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
        // CLOSE WITHDRAW MODAL
        setIsModalOpen(false);

        // OPEN SUCCESS MODAL
        setIsCongratulationModalOpen(true);

        // RESET AMOUNT
        setAmount("");

        // REFRESH TRANSACTIONS
        await fetchTransactions(1, pagination.limit, "");

        // REFRESH DEBIT CARD DATA
        setWalletRefreshKey((prev) => prev + 1);

        toast.success(t("messages.withdrawSuccess"));
      } else {
        toast.error(t("messages.withdrawFailed"));
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        t("messages.withdrawFailed");

      toast.error(msg);
    } finally {
      isSubmittingRef.current = false;

      setLoading(false);
    }
  };

  // =========================
  // WITHDRAW MODAL
  // =========================
  const firstModal = () => {
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
              {/* <CustomButton
                buttonText={
                  loading
                    ? t("withdrawModal.processing")
                    : t("withdrawModal.withdraw")
                }
                buttonSize={"medium"}
                type="submit"
              /> */}
              <CustomButton
                disabled={loading}
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

  // =========================
  // SUCCESS MODAL
  // =========================
  const secondModal = () => {
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

  // =========================
  // INITIAL FETCH
  // =========================
  useEffect(() => {
    fetchTransactions(1, pagination.limit, searchQuery);
  }, [i18n.language]);

  // =========================
  // OPEN/CLOSE WITHDRAW MODAL
  // =========================
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
      <ToastContainer position="top-center" closeOnClick autoClose={3000} />

      <h1>{t("heading")}</h1>

      <div className={styles.digitalWalletWrapper}>
        <DebitCard showAmount={true} refreshWallet={walletRefreshKey} />
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
                {
                  Header: t("table.transactionId"),
                  accessor: "transactionId",
                },
                {
                  Header: t("table.date"),
                  accessor: "date",
                },
                {
                  Header: t("table.time"),
                  accessor: "time",
                },
                {
                  Header: t("table.amount"),
                  accessor: "amount",
                },
                {
                  Header: t("table.status"),
                  accessor: "status",
                },
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
