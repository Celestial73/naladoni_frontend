import { createContext, useContext, useState, useCallback, useRef } from 'react';

/**
 * Data Cache Context Provider
 * Provides caching for page data to prevent unnecessary refetches on navigation
 */

const DataCacheContext = createContext(null);

export function DataCacheProvider({ children }) {
  // Cache for Feed page
  const [feedCache, setFeedCache] = useState({
    currentEvent: null,
    filters: { town: 'Москва', startDate: null, endDate: null, filtersEnabled: false },
    noEventsAvailable: false,
    lastFetchTime: null,
  });

  // Cache for Events page
  const [eventsCache, setEventsCache] = useState({
    myEvents: null,
    acceptedRequests: null,
    pendingRequestCounts: null,
    lastFetchTime: null,
  });

  // Cache for Profile page
  const [profileCache, setProfileCache] = useState({
    profileData: null,
    lastFetchTime: null,
  });

  // Cache timestamps to determine if data is stale
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  const isCacheValid = (lastFetchTime) => {
    if (!lastFetchTime) return false;
    return Date.now() - lastFetchTime < CACHE_DURATION;
  };

  // Feed cache methods
  const updateFeedCache = useCallback((updates) => {
    setFeedCache((prev) => ({
      ...prev,
      ...updates,
      lastFetchTime: Date.now(),
    }));
  }, []);

  const clearFeedCache = useCallback(() => {
    setFeedCache({
      currentEvent: null,
      filters: { town: 'Москва', startDate: null, endDate: null, filtersEnabled: false },
      noEventsAvailable: false,
      lastFetchTime: null,
    });
  }, []);

  // Events cache methods
  const updateEventsCache = useCallback((updates) => {
    setEventsCache((prev) => ({
      ...prev,
      ...updates,
      lastFetchTime: Date.now(),
    }));
  }, []);

  const clearEventsCache = useCallback(() => {
    setEventsCache({
      myEvents: null,
      acceptedRequests: null,
      pendingRequestCounts: null,
      lastFetchTime: null,
    });
  }, []);

  // Profile cache methods
  const updateProfileCache = useCallback((updates) => {
    setProfileCache((prev) => ({
      ...prev,
      ...updates,
      lastFetchTime: Date.now(),
    }));
  }, []);

  const clearProfileCache = useCallback(() => {
    setProfileCache({
      profileData: null,
      lastFetchTime: null,
    });
  }, []);

  const value = {
    // Feed cache
    feedCache,
    updateFeedCache,
    clearFeedCache,
    isFeedCacheValid: () => isCacheValid(feedCache.lastFetchTime),
    
    // Events cache
    eventsCache,
    updateEventsCache,
    clearEventsCache,
    isEventsCacheValid: () => isCacheValid(eventsCache.lastFetchTime),
    
    // Profile cache
    profileCache,
    updateProfileCache,
    clearProfileCache,
    isProfileCacheValid: () => isCacheValid(profileCache.lastFetchTime),
  };

  return (
    <DataCacheContext.Provider value={value}>
      {children}
    </DataCacheContext.Provider>
  );
}

export function useDataCache() {
  const context = useContext(DataCacheContext);
  if (!context) {
    throw new Error('useDataCache must be used within DataCacheProvider');
  }
  return context;
}

