import { useState, useEffect } from 'react';
import { useCachedFetch } from './useCachedFetch.js';
import { useDataCache } from '@/context/DataCacheProvider.jsx';
import { profileService } from '@/services/api/profileService.js';
import useAuth from './useAuth.js';

/**
 * Custom hook for managing profile edit data
 * Handles fetching profile for editing with form data transformation
 * 
 * @returns {Object} Profile edit data and controls
 */
export function useEditProfile() {
    const { auth } = useAuth();
    const { profileCache, updateProfileCache, isProfileCacheValid } = useDataCache();
    const [formData, setFormData] = useState({
        name: auth.user?.name || '',
        age: '',
        photos: [],
        bio: '',
        gender: '',
        customFields: [],
        interests: [],
        backgroundColor: 'd92326',
    });

    // Transform profile data to form data format
    const transformToFormData = (response) => {
        if (!response) return null;
        
        return {
            name: response.display_name || auth.user?.name || '',
            age: response.age?.toString() || '',
            photos: response.photos || [],
            bio: response.bio || '',
            gender: response.gender || '',
            customFields: (response.custom_fields || []).map((field, index) => ({
                id: field.id || `field-${index}-${Date.now()}`,
                title: field.title || '',
                value: field.value || '',
            })),
            interests: response.interests || [],
            backgroundColor: response.background_color || 'd92326',
        };
    };

    const {
        data: profileResponse,
        loading: fetching,
        error,
        refetch
    } = useCachedFetch({
        fetchFn: (signal) => profileService.getMyProfile(signal),
        cacheKey: 'profileData',
        cache: profileCache,
        isCacheValid: isProfileCacheValid,
        updateCache: updateProfileCache,
        errorMessage: 'Failed to fetch profile',
        enabled: !!auth?.initData,
        transform: transformToFormData
    });

    // Update formData when profileResponse changes
    useEffect(() => {
        if (profileResponse) {
            setFormData(profileResponse);
        }
    }, [profileResponse]);

    return {
        formData,
        setFormData,
        fetching,
        error,
        refetch
    };
}

