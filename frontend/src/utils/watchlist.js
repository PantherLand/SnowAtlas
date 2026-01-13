import Cookies from 'js-cookie';

const WATCHLIST_COOKIE_NAME = 'snowatlas_watchlist';
const COOKIE_EXPIRES = 365; // days

/**
 * Get watchlist from cookies
 * @returns {Array<string>} Array of resort IDs
 */
export const getWatchlist = () => {
  try {
    const watchlistStr = Cookies.get(WATCHLIST_COOKIE_NAME);
    return watchlistStr ? JSON.parse(watchlistStr) : [];
  } catch (error) {
    console.error('Error reading watchlist:', error);
    return [];
  }
};

/**
 * Save watchlist to cookies
 * @param {Array<string>} watchlist - Array of resort IDs
 */
export const saveWatchlist = (watchlist) => {
  try {
    Cookies.set(WATCHLIST_COOKIE_NAME, JSON.stringify(watchlist), {
      expires: COOKIE_EXPIRES
    });
  } catch (error) {
    console.error('Error saving watchlist:', error);
  }
};

/**
 * Add resort to watchlist
 * @param {string} resortId - Resort ID to add
 * @returns {Array<string>} Updated watchlist
 */
export const addToWatchlist = (resortId) => {
  const watchlist = getWatchlist();
  if (!watchlist.includes(resortId)) {
    const updated = [...watchlist, resortId];
    saveWatchlist(updated);
    return updated;
  }
  return watchlist;
};

/**
 * Remove resort from watchlist
 * @param {string} resortId - Resort ID to remove
 * @returns {Array<string>} Updated watchlist
 */
export const removeFromWatchlist = (resortId) => {
  const watchlist = getWatchlist();
  const updated = watchlist.filter(id => id !== resortId);
  saveWatchlist(updated);
  return updated;
};

/**
 * Check if resort is in watchlist
 * @param {string} resortId - Resort ID to check
 * @returns {boolean} True if in watchlist
 */
export const isInWatchlist = (resortId) => {
  const watchlist = getWatchlist();
  return watchlist.includes(resortId);
};

/**
 * Clear watchlist
 */
export const clearWatchlist = () => {
  saveWatchlist([]);
};
