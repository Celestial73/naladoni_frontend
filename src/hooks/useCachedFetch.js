import { useState, useEffect } from 'react';

/**
 * Custom hook for fetching data with cache support
 * Generic hook that works with any cache type
 * 
 * @param {Object} config
 * @param {Function} config.fetchFn - Function to fetch data (receives AbortSignal)
 * @param {string} config.cacheKey - Key in cache object to check/update
 * @param {Object} config.cache - Cache object
 * @param {Function} config.isCacheValid - Function to check if cache is valid
 * @param {Function} config.updateCache - Function to update cache
 * @param {string} config.errorMessage - Default error message
 * @param {boolean} config.enabled - Whether to enable fetching (default: true)
 * @param {Function} config.transform - Optional transform function for data
 * @param {*} config.initialValue - Initial value if cache is empty (default: null)
 * 
 * @returns {Object} { data, loading, error, refetch }
 */
export function useCachedFetch({
    fetchFn,
    cacheKey,
    cache,
    isCacheValid,
    updateCache,
    errorMessage = 'Не удалось загрузить данные',
    enabled = true,
    transform = null,
    initialValue = null
}) {
    const cachedValue = cache?.[cacheKey];
    const [data, setData] = useState(cachedValue !== undefined ? cachedValue : initialValue);
    const [loading, setLoading] = useState(!isCacheValid() || cachedValue === null || cachedValue === undefined);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!enabled) {
            setLoading(false);
            return;
        }

        // Check if we have valid cached data
        const cacheValid = isCacheValid();
        const hasCachedData = cachedValue !== null && cachedValue !== undefined;
        
        // Only fetch if cache is invalid or doesn't exist
        if (cacheValid && hasCachedData) {
            setLoading(false);
            return;
        }

        const abortController = new AbortController();

        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                let result = await fetchFn(abortController.signal);
                
                if (!abortController.signal.aborted) {
                    // Apply transform if provided
                    if (transform && result) {
                        result = transform(result);
                    }
                    
                    setData(result || initialValue);
                    updateCache({ [cacheKey]: result || initialValue });
                }
            } catch (err) {
                if (err.name !== 'AbortError' && err.name !== 'CanceledError') {
                    if (!abortController.signal.aborted) {
                        const errorMsg = err.response?.data?.message || err.message || errorMessage;
                        setError(errorMsg);
                    }
                }
            } finally {
                if (!abortController.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            abortController.abort();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled]); // Only run on mount or when enabled changes

    const refetch = async () => {
        setError(null);
        setLoading(true);
        
        try {
            let result = await fetchFn();
            
            // Apply transform if provided
            if (transform && result) {
                result = transform(result);
            }
            
            setData(result || initialValue);
            updateCache({ [cacheKey]: result || initialValue });
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || errorMessage;
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return { data, loading, error, refetch };
}

