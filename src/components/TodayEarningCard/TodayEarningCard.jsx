import React from 'react'
import styles from './today-earning-card.module.css';
import images from '../../assets/images';

const TodayEarningCard = () => {
    return (
        <div className={styles.earningCard}
            style={{ backgroundImage: `url(${images.earningCardBackgroundImage})` }}>
            <div className={styles.earningDetails}>
                <p className={styles.title}>Today's earning</p>
                <p className={styles.price}>$67,908,67</p>
            </div>
        </div>
    )
}

export default TodayEarningCard