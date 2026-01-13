import { axiosPrivate } from "../api/axios";
import { useEffect } from "react";
import useAuth from "./useAuth";

const useAxiosPrivate = () => {
    const { auth } = useAuth();

    useEffect(() => {
        const requestIntercept = axiosPrivate.interceptors.request.use(
            config => {
                // Log the full URL
                let fullUrl;
                if (config.url?.startsWith('http://') || config.url?.startsWith('https://')) {
                    // URL is already absolute
                    fullUrl = config.url;
                } else if (config.baseURL) {
                    // Construct full URL from baseURL and url
                    const baseURL = config.baseURL.endsWith('/') ? config.baseURL.slice(0, -1) : config.baseURL;
                    const url = config.url?.startsWith('/') ? config.url : `/${config.url || ''}`;
                    fullUrl = `${baseURL}${url}`;
                } else {
                    fullUrl = config.url || '';
                }
                // Add initData to Authorization header if available
                if (auth?.initData && !config.headers['Authorization']) {
                    config.headers['Authorization'] = `Bearer ${auth.initData}`;
                }
                
                // Add ngrok-skip-browser-warning header to bypass ngrok warning page
                if (!config.headers['ngrok-skip-browser-warning']) {
                    config.headers['ngrok-skip-browser-warning'] = 'true';
                }
                
                console.log('axiosPrivate Request URL:', fullUrl);
                console.log('axiosPrivate Request Headers:', config.headers);
                
                return config;
            }, (error) => Promise.reject(error)
        );

        return () => {
            axiosPrivate.interceptors.request.eject(requestIntercept);
        }
    }, [auth])

    return axiosPrivate;
}

export default useAxiosPrivate;