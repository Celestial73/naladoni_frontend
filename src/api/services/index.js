/**
 * API Services Index
 * Centralized export point for all API services
 * 
 * Usage:
 *   import { authService, eventsService, profileService } from '@/api/services';
 *   // or
 *   import * as apiServices from '@/api/services';
 */

export { authService } from './authService.js';
export { eventsService } from './eventsService.js';
export { profileService } from './profileService.js';
export { feedService } from './feedService.js';
export { eventActionsService } from './eventActionsService.js';
export { baseServiceConfig, withErrorHandling } from './baseService.js';

