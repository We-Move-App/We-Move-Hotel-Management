import React, { useEffect, useState } from 'react'
import styles from './leftBox.module.css';
import images from '../../assets/images';

const LeftBox = () => {
 
  return (
    <div style={{ backgroundImage: `url(${images?.leftBoxBackgroundImage})` }} className={styles.leftBox} >
      <div className={styles.whiteCircle}>
        <img src={images.trollyLogo} alt="logo" />
      </div>
    </div>
  )
}

export default LeftBox