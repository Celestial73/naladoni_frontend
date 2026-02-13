import { useCachedFetch } from './useCachedFetch.js';
import { useDataCache } from '@/context/DataCacheProvider.jsx';
import { profileService } from '@/services/api/profileService.js';
import useAuth from './useAuth.js';

/**
 * Custom hook for managing profile data
 * Handles fetching profile with cache support
 * 
 * @returns {Object} Profile data and controls
 */
export function useProfile() {
    const { auth } = useAuth();
    const { profileCache, updateProfileCache, isProfileCacheValid } = useDataCache();

    const {
        data: profileData,
        loading,
        error,
        refetch
    } = useCachedFetch({
        fetchFn: (signal) => profileService.getMyProfile(signal),
        cacheKey: 'profileData',
        cache: profileCache,
        isCacheValid: isProfileCacheValid,
        updateCache: updateProfileCache,
        errorMessage: 'Failed to fetch profile',
        enabled: !!auth?.initData
    });

    return {
        profileData,
        loading,
        error,
        refetch
    };
}

