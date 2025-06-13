import React, { useEffect, useState } from 'react'
import styles from './navbar.module.css';
import images from '../../assets/images';
import { MdKeyboardArrowDown } from 'react-icons/md';
import { IoMenu, IoClose } from "react-icons/io5";
import NotificationIcon from '../reusable/NotificationIcon/NotificationIcon';
import CustomButton from '../reusable/custom/CButton/CustomButton';
import { TbLogout2 } from "react-icons/tb";
import { useAuth } from '../../context/AuthContext';
import useNavigation from '../../hooks/useNavigation';
import { ENDPOINTS } from '../../utils/apiEndpoints';
import apiCall from '../../hooks/apiCall';
import { tokenFromLocalStorage } from '../../utils/helperFunctions';
import CustomDropDown from '../reusable/custom/CDropDown/CustomDropDown';

const Navbar = ({ toggleSidebar, isMobile, isOpen }) => {
    // const token = tokenFromLocalStorage();
    const { logout } = useAuth()
    const { goTo } = useNavigation()
    const [userName, setUserName] = useState('');
    const [userProfile, setUserProfile] = useState('');


    const handleProfileNavigation = () => {
        goTo('/dashboard/profile');
    }


    const handleLogout = () => {
        logout()
        return;
    }
    const customDropDownList = [
        { label: 'Profile', onClick: handleProfileNavigation },
        { label: 'Logout', onClick: handleLogout },
        // { href: '#item3', label: 'Item 3' },
    ]

    const fetchUserDetails = async () => {
        const { data, statusCode, error, success } = await apiCall(ENDPOINTS.PROFILE, 'GET', {
            // headers: {
            //     Authorization: `Bearer ${token}`
            // }
        });

        if (success && statusCode === 200) {
            const { email, phoneNumber, fullName, avatar } = data?.data?.user;
            setUserName(fullName);
            avatar ? setUserProfile(avatar?.url) : setUserProfile(images.profileImage)
        } else {
            return;
        }
    }

    const logoClicked = async () => {
        goTo('/')
    }
    useEffect(() => {
        fetchUserDetails();
    }, [])

    return (
        <nav nav className={styles.nav} >
            <div className={styles.logoWrapper}>
                {
                    isMobile && !isOpen && (
                        <div className={styles.menuIconBox} >
                            <IoMenu onClick={toggleSidebar} />
                        </div>
                    )
                }
                {
                    isMobile && isOpen && (
                        <div className={styles.menuIconBox} >
                            <IoClose onClick={toggleSidebar} />
                        </div>
                    )
                }
                <div className={styles.logoBox}>
                    <img src={images.weMoveLogo} alt="nav-logo" onClick={logoClicked} />
                    <span>WeMove All</span>
                </div>
            </div>

            <div className={styles.navProfileSection}>
                {/* <div>
                    <CustomButton buttonSize={'small'} buttonText={''} icon={<TbLogout2 />} onClick={handleLogout} />
                </div> */}

                <div className={styles.profileContainer}>
                    <div className={styles.profileImageBox} onClick={() => goTo('/dashboard/profile')}  >
                        <img src={userProfile} alt="profile-image" />
                    </div>
                    <div className={styles.profileText}>
                        <span><p>{userName}</p></span>
                        {/* <span><MdKeyboardArrowDown /></span> */}
                        <CustomDropDown items={customDropDownList} />
                    </div>
                </div>

                <div className={styles.notification}>
                    {/* <img src={images.notificationBell} alt="notification-bell" /> */}
                    <NotificationIcon />
                </div>
            </div>
        </nav >
    )
}

export default Navbar