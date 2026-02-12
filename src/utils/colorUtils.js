/**
 * Color utility functions
 */

/**
 * Darken a hex color by a given factor.
 * @param {string} hex - Hex color string (with or without #, 6 chars)
 * @param {number} factor - Factor to darken by (0 = black, 1 = unchanged). Default 0.5
 * @returns {string} Darkened hex color with # prefix
 */
export function darkenHex(hex, factor = 0.5) {
    const clean = hex.replace('#', '');
    const r = Math.round(parseInt(clean.substring(0, 2), 16) * factor);
    const g = Math.round(parseInt(clean.substring(2, 4), 16) * factor);
    const b = Math.round(parseInt(clean.substring(4, 6), 16) * factor);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * Normalize a background_color value from the API (hex without #) to a CSS-ready #hex string.
 * Falls back to the provided default if the value is missing or invalid.
 * @param {string|undefined} apiColor - The background_color from the API (e.g. "d92326")
 * @param {string} fallback - Fallback CSS color (e.g. "#d92326")
 * @returns {string} CSS hex color string
 */
export function normalizeApiColor(apiColor, fallback = '#d92326') {
    if (!apiColor || typeof apiColor !== 'string') return fallback;
    const clean = apiColor.replace('#', '');
    if (!/^[0-9A-Fa-f]{6}$/.test(clean)) return fallback;
    return `#${clean}`;
}

