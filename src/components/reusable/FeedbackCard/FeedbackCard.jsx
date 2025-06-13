import React from 'react'
import styles from './feedback-card.module.css';


const FeedbackCard = ({
    name,
    date,
    rating,
    feedback,
    avatarUrl
}) => {
    const renderStars = () => {
        return [...Array(5)].map((_, index) => (
            <span key={index} className={styles.star}>
                {index < rating ? '★' : '☆'}
            </span>
        ));
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className={styles.card}>
            <div className={styles.detailsBox}>
                <div className={styles.header}>
                    <img
                        src={avatarUrl}
                        alt={`${name}'s avatar`}
                        className={styles.avatar}
                    />
                    <div className={styles.userInfo}>
                        <h3 className={styles.name}>{name}</h3>
                        <p className={styles.date}>{formatDate(date)}</p>
                    </div>
                </div>
                <div className={styles.stars}>
                    {renderStars()}
                </div>
            </div>
            <p className={styles.feedback}>{feedback}</p>
        </div>
    );
}

export default FeedbackCard;