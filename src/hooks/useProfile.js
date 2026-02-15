import { useCachedFetch } from './useCachedFetch.js';
import { profileService } from '@/api/services/profileService.js';
import { useDataCache } from '@/context/DataCacheProvider.jsx';
import useAuth from '@/hooks/useAuth';

/**
 * Custom hook for managing profile data
 * Handles fetching current user's profile with cache support
 * 
 * @returns {Object} Profile data, loading state, error, and refetch function
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
        errorMessage: 'Не удалось загрузить профиль',
        enabled: !!auth?.initData,
        initialValue: null
    });

    return {
        profileData,
        loading,
        error,
        refetch
    };
}


