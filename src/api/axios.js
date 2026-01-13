import axios from 'axios';

const BASE_URL = 'https://d15b29b14139.ngrok-free.app/v1';

const axiosInstance = axios.create({
    baseURL: BASE_URL
});

export const axiosPrivate = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' }
});

export default axiosInstance;