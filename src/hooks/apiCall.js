
import axios from 'axios';
import { tokenFromLocalStorage } from '../utils/helperFunctions';
// import { getAccessToken, setAccessToken, clearAccessToken } from './authToken';

const BASEURL = import.meta.env.VITE_BASE_URL;
const apiVersion = '/api/v1';

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

const apiCall = async (url, method = 'GET', { body = null, params = {}, headers = {}, options = {} } = {}) => {
  const fullUrl = `${BASEURL}${apiVersion}${url}`;

  const token = tokenFromLocalStorage();

  const axiosInstance = axios.create();

  // Attach Authorization header
  axiosInstance.interceptors.request.use((config) => {
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    if (!(body instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    return config;
  });

  // Handle refresh logic
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers['Authorization'] = 'Bearer ' + token;
              return axiosInstance(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const res = await axios.post(`${BASEURL}${apiVersion}/hotel-manager/auth/refresh-token`, {}, { withCredentials: true });
          const newToken = res.data.accessToken;

          setAccessToken(newToken);
          processQueue(null, newToken);

          originalRequest.headers['Authorization'] = 'Bearer ' + newToken;
          return axiosInstance(originalRequest);
        } catch (err) {
          processQueue(err, null);
          localStorage.clear();
          window.location.reload();

          // clearAccessToken();
          // Optionally redirect to login
          return Promise.reject(err);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );

  try {
    const axiosConfig = {
      method,
      url: fullUrl,
      params,
      data: body,
      headers,
      withCredentials: true,
      ...options,
    };

    const response = await axiosInstance(axiosConfig);

    return {
      data: response.data,
      statusCode: response.status,
      error: null,
      success: response.data.success,
    };
  } catch (error) {
    console.log(error)
    return {
      data: null,
      statusCode: error.response?.status || 500,
      error: error.response?.data || 'Network Error',
    };
  }
};

export default apiCall;



// import axios from 'axios';

// const apiCall = async (url, method = 'GET', { body = null, params = {}, headers = {}, options = {} } = {}) => {
//     const BASEURL = import.meta.env.VITE_BASE_URL || 'http://142.93.222.196:8001'; // Environment base URL
//     const apiVersion = '/api/v1'; // API version

//     try {
//         const fullUrl = `${BASEURL}${apiVersion}${url}`;

//         // Axios config object
//         const axiosConfig = {
//             method, // HTTP method (GET, POST, PUT, DELETE)
//             url: fullUrl, // Complete URL
//             headers: {
//                 ...(body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
//                 ...headers, // Additional headers if provided
//             },
//             withCredentials: true, // Include credentials (cookies, etc.)
//             ...options, // Additional Axios options (timeout, etc.)
//         };

//         // Add parameters for GET requests
//         if (method === 'GET' && params) {
//             axiosConfig.params = params;
//         }

//         // Add body for POST, PUT, DELETE methods
//         if (['POST', 'PUT', 'DELETE'].includes(method) && body) {
//             axiosConfig.data = body;
//         }

//         // Perform the Axios request
//         const response = await axios(axiosConfig);
//         // console.log("In ApiCall Response: ",response)

//         return {
//             data: response.data,
//             statusCode: response.status,
//             error: null,
//             success: response.data.success,
//         };
//     } catch (error) {
//         return {
//             data: null,
//             statusCode: error.response ? error.response.status : 500,
//             error: error.response ? error.response.data : 'Network Error',
//         };
//     }
// };

// export default apiCall;

