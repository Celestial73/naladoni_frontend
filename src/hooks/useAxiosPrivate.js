import { axiosPrivate } from "../api/axios";
import { useEffect } from "react";
import useAuth from "./useAuth";
import { logAxiosRequest, logAxiosRequestError } from "../helpers/axiosLogger";

const useAxiosPrivate = () => {
    const { auth } = useAuth();

    useEffect(() => {
        const requestIntercept = axiosPrivate.interceptors.request.use(
            config => {
                // Add initData to Authorization header if available
                if (auth?.initData && !config.headers['Authorization']) {
                    config.headers['Authorization'] = `Bearer ${auth.initData}`;
                }
                
                // Add ngrok-skip-browser-warning header to bypass ngrok warning page
                if (!config.headers['ngrok-skip-browser-warning']) {
                    config.headers['ngrok-skip-browser-warning'] = 'true';
                }
                
                // Log full request details
                logAxiosRequest(config, 'useAxiosPrivate Request');
                
                return config;
            }, (error) => {
                logAxiosRequestError(error, 'useAxiosPrivate Request');
                return Promise.reject(error);
            }
        );

        return () => {
            axiosPrivate.interceptors.request.eject(requestIntercept);
        }
    }, [auth])

    return axiosPrivate;
}

export default useAxiosPrivate;