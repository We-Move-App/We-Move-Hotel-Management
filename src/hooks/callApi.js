import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';

// const callApi = (
//   url, 
//   method = 'GET', 
//   {
//     params = {}, 
//     body = null, 
//     headers = {}, 
//     options = {}
//   } = {}) => {

//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const BASEURL = import.meta.env.VITE_BASE_URL || 'http://142.93.222.196:8001'; // Environment base URL
//   const apiVersion = '/api/v1'; // API version

//   const fetchData = useCallback(async () => {
//     setLoading(true);
//     setError(null);

//     try {
//       // Build full API URL
//       const fullUrl = `${BASEURL}${apiVersion}${url}`;

//       // Axios config object
//       const axiosConfig = {
//         method, // HTTP method
//         url: fullUrl, // Complete URL
//         headers: {
//           'Content-Type': 'application/json', 
//           ...headers, // Additional headers if provided
//         },
//         withCredentials: true, // Include credentials (cookies, etc.)
//         ...options, // Additional Axios options
//       };

//       // If the method is GET, include params in the config
//       if (method === 'GET' && params) {
//         axiosConfig.params = params;
//       }

//       // For POST, PUT, DELETE methods, attach the body
//       if (['POST', 'PUT', 'DELETE'].includes(method) && body) {
//         axiosConfig.data = body;
//       }

//       // Perform the Axios request
//       const response = await axios(axiosConfig);

//       setData(response.data); // Set the response data

//     } catch (error) {
//       // Capture the error message
//       setError(error.response?.data?.message || 'Something went wrong!');
//     } finally {
//       setLoading(false); // Set loading to false
//     }

//   }, [url, method, params, body, headers, options]);

//   useEffect(() => {
//     fetchData();
//   }, [fetchData]);

//   return { data, loading, error, refetch: fetchData };
// };

const callApi = (
    url,
    method = 'GET',
    {
        params = {},
        body = null,
        headers = {},
        options = {}
    } = {}
) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const BASEURL = import.meta.env.VITE_BASE_URL || 'http://142.93.222.196:8001';
    const apiVersion = '/api/v1';

    // Memoize the incoming arguments to prevent them from changing unnecessarily
    const memoizedParams = useMemo(() => params, [JSON.stringify(params)]);
    const memoizedHeaders = useMemo(() => headers, [JSON.stringify(headers)]); //[JSON.stringify(headers)]
    const memoizedOptions = useMemo(() => options, [JSON.stringify(options)]);
    const memoizedBody = useMemo(() => body, [JSON.stringify(body)]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const fullUrl = `${BASEURL}${apiVersion}${url}`;

            const axiosConfig = {
                method,
                url: fullUrl,
                headers: {
                    'Content-Type': 'application/json',
                    ...memoizedHeaders,
                },
                withCredentials: true,
                ...memoizedOptions,
            };

            if (method === 'GET' && memoizedParams) {
                axiosConfig.params = memoizedParams;
            }

            if (['POST', 'PUT', 'DELETE'].includes(method) && memoizedBody) {
                axiosConfig.data = memoizedBody;
            }

            const response = await axios(axiosConfig);
            setData(response.data);

        } catch (error) {
            setError(error.response?.data?.message || 'Something went wrong!');
        } finally {
            setLoading(false);
        }

    }, [url, method, memoizedParams, memoizedHeaders, memoizedOptions, memoizedBody]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refetch: fetchData };
};



// const useApi = () => {
//     const [data, setData] = useState(null);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState(null);

//     const callApi = useCallback(
//         async (url, method = 'GET', { body = null, params = {}, headers = {}, options = {} } = {}) => {
//             setLoading(true);
//             setError(null);
//             const BASEURL = import.meta.env.VITE_BASE_URL || 'http://142.93.222.196:8001'; // Environment base URL
//             const apiVersion = '/api/v1'; // API version

//             try {
//                 // Build full API URL
//                 const fullUrl = `${BASEURL}${apiVersion}${url}`;

//                 // Axios config object
//                 const axiosConfig = {
//                     method, // HTTP method (GET, POST, PUT, DELETE)
//                     url: fullUrl, // Complete URL
//                     headers: {
//                         'Content-Type': 'application/json',
//                         ...headers, // Additional headers if provided
//                     },
//                     withCredentials: true, // Include credentials (cookies, etc.)
//                     ...options, // Additional Axios options (timeout, etc.)
//                 };

//                 // Add parameters for GET requests
//                 if (method === 'GET' && params) {
//                     axiosConfig.params = params;
//                 }

//                 // Add body for POST, PUT, DELETE methods
//                 if (['POST', 'PUT', 'DELETE'].includes(method) && body) {
//                     axiosConfig.data = body;
//                 }

//                 // Perform the Axios request
//                 const response = await axios(axiosConfig);

//                 setData(response.data); // Set the response data

//             } catch (err) {
//                 // Capture the error message
//                 setError(err.response?.data?.message || 'Something went wrong!');
//             } finally {
//                 setLoading(false); // Set loading to false after the request completes
//             }
//         },
//         []
//     );

//     // Return the fetchData function to trigger the API call externally and allow dynamic control
//     return { data, loading, error, callApi };
// };

export default callApi;
