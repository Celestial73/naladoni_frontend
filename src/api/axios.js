import axios from 'axios';

// Use environment variable with fallback for development
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://d15b29b14139.ngrok-free.app/v1';

export default axios.create({
    baseURL: BASE_URL
});

export const axiosPrivate = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' }
});