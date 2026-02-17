/**
 * Participant Data Utilities
 * Centralized functions for extracting and working with participant data
 * 
 * API Structure:
 * - participants: Arrrrrrrrrrrrrray of {profile, user}
 * - profile: Always present (required)
 * - user: Optional, only present when requester is event owner or using /events/me endpoint
 */

/**
 * Extract participant ID from a participant/attendee object
 * Uses profile_id as primary identifier since profile is always present
 * 
 * @param {Object} participant - Participant object (transformed or raw)
 * @returns {string|null} Participant ID (profile_id) or null if not found
 */
export const getParticipantId = (participant) => {
  if (!participant) return null;
  
  // Priority: profile_id (from transformed structure) > profile.id > profile._id
  if (participant.profile_id) {
    return String(participant.profile_id);
  }
  
  // If raw API structure, extract from profile
  if (participant.profile) {
    const profile = participant.profile;
    if (profile.id) return String(profile.id);
    if (profile._id) return String(profile._id);
  }
  
  // Fallback for legacy/transformed structures
  if (participant.id) return String(participant.id);
  
  return null;
};

/**
 * Extract user ID from a participant/attendee object
 * User ID may not always be available (user field is optional)
 * 
 * @param {Object} participant - Participant object (transformed or raw)
 * @returns {string|null} User ID or null if not found
 */
export const getParticipantUserId = (participant) => {
  if (!participant) return null;
  
  // From transformed structure
  if (participant.user_id) {
    return String(participant.user_id);
  }
  
  // From raw API structure
  if (participant.user) {
    const user = participant.user;
    if (user.id) return String(user.id);
    if (user._id) return String(user._id);
  }
  
  return null;
};

/**
 * Extract profile ID from a participant/attendee object
 * Profile ID is always available since profile is required
 * 
 * @param {Object} participant - Participant object (transformed or raw)
 * @returns {string|null} Profile ID or null if not found (shouldn't happen)
 */
export const getProfileId = (participant) => {
  return getParticipantId(participant); // Same as participant ID
};

/**
 * Check if participant has user data available
 * 
 * @param {Object} participant - Participant object (transformed or raw)
 * @returns {boolean} True if user data is available
 */
export const hasUserData = (participant) => {
  if (!participant) return false;
  
  // Check transformed structure
  if (participant.user_id || participant.user) return true;
  
  // Check raw structure
  if (participant.user && typeof participant.user === 'object') {
    return !!(participant.user.id || participant.user._id);
  }
  
  return false;
};

/**
 * Get participant display name
 * Falls back through profile_name, telegram_name, or empty string
 * 
 * @param {Object} participant - Participant object (transformed or raw)
 * @returns {string} Display name
 */
export const getParticipantName = (participant) => {
  if (!participant) return '';
  
  // From transformed structure
  if (participant.profile_name) return participant.profile_name;
  
  // From raw structure
  if (participant.profile?.profile_name) return participant.profile.profile_name;
  if (participant.user?.telegram_name) return participant.user.telegram_name;
  
  return '';
};

/**
 * Get participant image URL
 * Prioritizes profile images, falls back to user image
 * 
 * @param {Object} participant - Participant object (transformed or raw)
 * @returns {string|null} Image URL or null
 */
export const getParticipantImage = (participant) => {
  if (!participant) return null;
  
  // From transformed structure
  if (participant.images && participant.images.length > 0) {
    return participant.images[0];
  }
  if (participant.image_url) return participant.image_url;
  if (participant.image) return participant.image;
  
  // From raw structure
  if (participant.profile?.images && participant.profile.images.length > 0) {
    return participant.profile.images[0];
  }
  if (participant.user?.image_url) return participant.user.image_url;
  
  return null;
};

