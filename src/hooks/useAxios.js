import axiosInstance from "../api/axios";
import { useEffect } from "react";

const useAxios = () => {
    useEffect(() => {
        const requestIntercept = axiosInstance.interceptors.request.use(
            config => {
                // Add ngrok-skip-browser-warning header to bypass ngrok warning page
                if (!config.headers['ngrok-skip-browser-warning']) {
                    config.headers['ngrok-skip-browser-warning'] = 'true';
                }
                
                return config;
            }, (error) => Promise.reject(error)
        );

        return () => {
            axiosInstance.interceptors.request.eject(requestIntercept);
        }
    }, [])

    return axiosInstance;
}

export default useAxios;

