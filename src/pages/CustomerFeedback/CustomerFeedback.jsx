import React, { useEffect, useState } from "react";
import styles from "./customer-feedback.module.css";
import FeedbackCard from "../../components/reusable/FeedbackCard/FeedbackCard";
import PaginationComponent from "../../components/reusable/Pagination/PaginationComponent";
import apiCall from "../../hooks/apiCall";
import { ENDPOINTS } from "../../utils/apiEndpoints";
import { tokenFromLocalStorage } from "../../utils/helperFunctions";
import ContentHeading from "../../components/reusable/Content-Heading/ContentHeading";
import Pagination from "../../components/reusable/PaginationNew/Pagination";

const CustomerFeedback = () => {
  // const token = tokenFromLocalStorage();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState([]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  const feedbackData = {
    name: "Jason Rachel",
    date: "2024-10-01",
    rating: 5,
    feedback:
      "The app is very user-friendly! I can easily book tickets and check bus schedules without any confusion. The ability to book tickets in advance and select my seat is a game-changer for me. The interface is clean and intuitive, making the whole experience seamless.",
    avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg",
  };

  const getFeedback = async () => {
    const { data, success, statusCode, error } = await apiCall(
      `${ENDPOINTS.FEEDBACK}?page=${currentPage}&limit=${6}`,
      "GET",
      {
        // headers: {
        //     Authorization: `Bearer ${token}`
        // }
      }
    );
    if (success) {
      const { feedbacks, page } = data?.data;
      console.log(data);
      setCurrentPage(page);
      setFeedback(data?.data?.feedbacks);
      // setTotalPages()
      setLoading(false);
    }
  };

  useEffect(() => {
    getFeedback();
  }, [loading, currentPage]);

  return (
    <>
      <div className={styles.headerBox}>
        {/* <h1>Customer Feedback</h1> */}
        <ContentHeading heading="Customer Feedback" />
      </div>

      <div className={styles.contentBoxWrapper}>
        <p>Customer Feedback</p>

        <div className={styles.customerFeedbackBox}>
          <div className={styles.feedbackGrid}>
            {feedback?.map((item, i) => (
              <div key={item._id}>
                <FeedbackCard
                  name={item?.userId?.fullName}
                  date={item?.createdAt}
                  rating={item?.rating}
                  feedback={item?.comment}
                  avatarUrl={item?.userId?.avatar?.url}
                />
              </div>
            ))}

            {/* name,
                            date,
                            rating,
                            feedback,
                            avatarUrl */}
            {/* <FeedbackCard {...feedbackData} /> */}
            {/* <FeedbackCard {...feedbackData} />
                            <FeedbackCard {...feedbackData} />
                            <FeedbackCard {...feedbackData} />
                            <FeedbackCard {...feedbackData} />
                            <FeedbackCard {...feedbackData} /> */}
          </div>

          {totalPages > 1 && (
            <div className={styles.paginationWrapper}>
              {/* <PaginationComponent
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              /> */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CustomerFeedback;
