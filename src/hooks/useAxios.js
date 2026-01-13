import axiosInstance from "../api/axios";
import { useEffect } from "react";

const useAxios = () => {
    useEffect(() => {
        const requestIntercept = axiosInstance.interceptors.request.use(
            config => {
                // Construct full URL
                let fullUrl;
                if (config.url?.startsWith('http://') || config.url?.startsWith('https://')) {
                    fullUrl = config.url;
                } else if (config.baseURL) {
                    const baseURL = config.baseURL.endsWith('/') ? config.baseURL.slice(0, -1) : config.baseURL;
                    const url = config.url?.startsWith('/') ? config.url : `/${config.url || ''}`;
                    fullUrl = `${baseURL}${url}`;
                } else {
                    fullUrl = config.url || '';
                }

                // Add ngrok-skip-browser-warning header to bypass ngrok warning page
                if (!config.headers['ngrok-skip-browser-warning']) {
                    config.headers['ngrok-skip-browser-warning'] = 'true';
                }
                
                // Log full request details
                console.log('=== useAxios Request ===');
                console.log('URL:', fullUrl);
                console.log('Method:', config.method?.toUpperCase());
                console.log('Headers:', config.headers);
                console.log('Params:', config.params);
                console.log('Body:', config.data);
                console.log('========================');
                
                return config;
            }, (error) => {
                console.error('useAxios Request Error:', error);
                return Promise.reject(error);
            }
        );

        return () => {
            axiosInstance.interceptors.request.eject(requestIntercept);
        }
    }, [])

    return axiosInstance;
}

export default useAxios;

