import axiosInstance from "../api/axios";
import { useEffect } from "react";
import { logAxiosRequest, logAxiosRequestError } from "../helpers/axiosLogger";

const useAxios = () => {
    useEffect(() => {
        const requestIntercept = axiosInstance.interceptors.request.use(
            config => {
                // Add ngrok-skip-browser-warning header to bypass ngrok warning page
                if (!config.headers['ngrok-skip-browser-warning']) {
                    config.headers['ngrok-skip-browser-warning'] = 'true';
                }
                
                // Log full request details
                logAxiosRequest(config, 'useAxios Request');
                
                return config;
            }, (error) => {
                logAxiosRequestError(error, 'useAxios Request');
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

