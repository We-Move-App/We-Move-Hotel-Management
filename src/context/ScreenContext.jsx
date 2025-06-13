import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the context
const ScreenContext = createContext();

// Custom hook to use the ScreenContext
export const useScreen = () => useContext(ScreenContext);

// Define your breakpoints
const BREAKPOINTS = {
    mobile: 768,   // max-width for mobile
    tablet: 1024,  // max-width for tablet
    laptop: 1280,  // max-width for laptop
};

// ScreenProvider component
export const ScreenProvider = ({ children }) => {
    const [screenSize, setScreenSize] = useState({
        isMobile: window.innerWidth <= BREAKPOINTS.mobile,
        isTablet: window.innerWidth > BREAKPOINTS.mobile && window.innerWidth <= BREAKPOINTS.tablet,
        isLaptop: window.innerWidth > BREAKPOINTS.tablet && window.innerWidth <= BREAKPOINTS.laptop,
        isDesktop: window.innerWidth > BREAKPOINTS.laptop,
    });

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;

            setScreenSize({
                isMobile: width <= BREAKPOINTS.mobile,
                isTablet: width > BREAKPOINTS.mobile && width <= BREAKPOINTS.tablet,
                isLaptop: width > BREAKPOINTS.tablet && width <= BREAKPOINTS.laptop,
                isDesktop: width > BREAKPOINTS.laptop,
            });
        };

        window.addEventListener('resize', handleResize);

        // Clean up the event listener on component unmount
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <ScreenContext.Provider value={screenSize}>
            {children}
        </ScreenContext.Provider>
    );
};
