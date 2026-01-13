/**
 * Constructs the full URL from axios config
 * @param {import('axios').AxiosRequestConfig} config - Axios request config
 * @returns {string} Full URL
 */
export const constructFullUrl = (config) => {
    if (config.url?.startsWith('http://') || config.url?.startsWith('https://')) {
        return config.url;
    } else if (config.baseURL) {
        const baseURL = config.baseURL.endsWith('/') ? config.baseURL.slice(0, -1) : config.baseURL;
        const url = config.url?.startsWith('/') ? config.url : `/${config.url || ''}`;
        return `${baseURL}${url}`;
    } else {
        return config.url || '';
    }
};

/**
 * Logs axios request details
 * @param {import('axios').AxiosRequestConfig} config - Axios request config
 * @param {string} prefix - Log prefix (e.g., 'useAxios Request', 'useAxiosPrivate Request')
 */
export const logAxiosRequest = (config, prefix = 'Axios Request') => {
    const fullUrl = constructFullUrl(config);
    
    console.log(`=== ${prefix} ===`);
    console.log('URL:', fullUrl);
    console.log('Method:', config.method?.toUpperCase());
    console.log('Headers:', config.headers);
    console.log('Params:', config.params);
    console.log('Body:', config.data);
    console.log('='.repeat(prefix.length + 6));
};

/**
 * Logs axios request error
 * @param {Error} error - Request error
 * @param {string} prefix - Log prefix
 */
export const logAxiosRequestError = (error, prefix = 'Axios Request') => {
    console.error(`${prefix} Error:`, error);
};

