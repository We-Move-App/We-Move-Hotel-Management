import { jwtDecode } from "jwt-decode";
import apiCall from "../hooks/apiCall";
import { ENDPOINTS } from "./apiEndpoints";



export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const maskInput = (input) => {
    // Check if the input is a mobile number (assuming it's a 10-digit number)
    if (/^\d{10}$/.test(input)) {
        // Mask mobile number as *** *** 1234
        return `*** *** ${input.slice(-4)}`;
    }
    // Check if the input is an email
    else if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input)) {
        // Split the email into parts
        let [localPart, domain] = input.split('@');
        // Keep the last 2 characters of the local part, mask the rest
        let maskedLocal = `${'*'.repeat(localPart.length - 2)}${localPart.slice(-2)}`;
        // Return the masked email
        return `${maskedLocal}@${domain}`;
    }
    // If input is neither mobile nor email, return invalid
    else {
        return 'Invalid input';
    }
}

export const tokenDecode = (token) => {
    // Decode the token using the 'jsonwebtoken' library
    const decoded = jwtDecode(token);
    // Return the decoded token
    return decoded;
}

export const tokenFromLocalStorage = () => {
    const wemoveToken = JSON.parse(localStorage.getItem('WEMOVE_TOKEN'));
    return wemoveToken ? wemoveToken.accessToken : undefined;
}

export const getDataFromLocalStorage = (key) => {
    const data = JSON.parse(localStorage.getItem(key));
    return data ? data : undefined;
}

export const getAmenities = async () => {
    try {
        const { data, satusCode, error, success } = await apiCall(`${ENDPOINTS.GET_AMENITIES}`, {});
        if (error) {
            console.log(error);
        } else {
            console.log(data)
            return data.data
        }
    } catch (error) {
        return error
    }
}