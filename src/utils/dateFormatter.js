/**
 * Convert ISO datetime string to dd-mm-yyyy format
 * @param {string} isoString - ISO datetime string (e.g., "5555-02-14T21:00:00.000+00:00")
 * @returns {string} Date in dd-mm-yyyy format (e.g., "14-02-5555") or empty string if invalid
 */
export const formatDateToDDMMYYYY = (isoString) => {
  if (!isoString) return '';
  
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}-${month}-${year}`;
  } catch (error) {
    return '';
  }
};

/**
 * Parse date string (DD.MM.YYYY) to Date object (normalized to midnight)
 * @param {string} dateStr - Date string in DD.MM.YYYY format
 * @returns {Date|null} Date object or null if invalid
 */
export const parseDate = (dateStr) => {
  if (!dateStr) return null;
  const parts = dateStr.split('.');
  if (parts.length !== 3) return null;
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
  const year = parseInt(parts[2], 10);
  return new Date(year, month, day, 0, 0, 0, 0);
};

/**
 * Format Date to DD.MM.YYYY
 * @param {Date} date - Date object
 * @returns {string} Date string in DD.MM.YYYY format or empty string if invalid
 */
export const formatDate = (date) => {
  if (!date) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};

/**
 * Normalize date to midnight for comparison
 * @param {Date} date - Date object
 * @returns {Date|null} Normalized date or null if invalid
 */
export const normalizeDate = (date) => {
  if (!date) return null;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
};

/**
 * Convert Date to YYYY-MM-DD format for API
 * @param {Date} date - Date object
 * @returns {string|null} Date string in YYYY-MM-DD format or null if invalid
 */
export const formatDateToAPI = (date) => {
  if (!date) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

