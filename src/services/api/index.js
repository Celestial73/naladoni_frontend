/**
 * API Services Index
 * Centralized export point for all API services
 * 
 * Usage:
 *   import { authService, eventsService, profileService } from '@/services/api';
 *   // or
 *   import * as apiServices from '@/services/api';
 */

export { authService } from './authService.js';
export { eventsService } from './eventsService.js';
export { profileService } from './profileService.js';
export { baseServiceConfig, withErrorHandling } from './baseService.js';

