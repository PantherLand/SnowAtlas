const geoip = require('geoip-lite');
const skiResorts = require('../data/skiResorts.json');

/**
 * Get user's location from IP address
 * @param {string} ip - User's IP address
 * @returns {Object} Location information
 */
function getLocationFromIP(ip) {
  // Handle localhost/development
  if (ip === '::1' || ip === '127.0.0.1' || ip === '::ffff:127.0.0.1') {
    return {
      country: 'CN',
      city: 'Development',
      ll: [39.9042, 116.4074] // Beijing
    };
  }

  const geo = geoip.lookup(ip);
  return geo;
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 * @param {number} lat1 - Latitude 1
 * @param {number} lon1 - Longitude 1
 * @param {number} lat2 - Latitude 2
 * @param {number} lon2 - Longitude 2
 * @returns {number} Distance in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

function attachDistance(resorts, ip) {
  const location = getLocationFromIP(ip);
  if (!location || !location.ll) {
    return resorts.map(resort => ({
      ...resort,
      distance: null
    }));
  }

  const [userLat, userLon] = location.ll;
  return resorts.map(resort => {
    const distance = calculateDistance(
      userLat,
      userLon,
      resort.coordinates.lat,
      resort.coordinates.lon
    );

    return {
      ...resort,
      distance: Math.round(distance)
    };
  });
}

/**
 * Find nearest ski resorts to user's location
 * @param {string} ip - User's IP address
 * @param {number} limit - Maximum number of resorts to return
 * @returns {Array} Nearest ski resorts with distance
 */
function getNearestResorts(ip, limit = 5) {
  const location = getLocationFromIP(ip);

  if (!location || !location.ll) {
    // Return popular resorts if location cannot be determined
    return skiResorts
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, limit)
      .map(resort => ({
        ...resort,
        distance: null
      }));
  }

  const [userLat, userLon] = location.ll;

  // Calculate distance to each resort
  const resortsWithDistance = attachDistance(skiResorts, ip);

  // Sort by distance and return top results
  // Also consider popularity for nearby resorts
  return resortsWithDistance
    .sort((a, b) => {
      // If both are within 500km, prioritize by popularity
      if (a.distance < 500 && b.distance < 500) {
        return b.popularity - a.popularity;
      }
      // Otherwise sort by distance
      return a.distance - b.distance;
    })
    .slice(0, limit);
}

/**
 * Get resorts by country
 * @param {string} countryCode - Two-letter country code
 * @returns {Array} Ski resorts in the country
 */
function getResortsByCountry(countryCode) {
  return skiResorts.filter(resort => resort.countryCode === countryCode);
}

/**
 * Get resort by ID
 * @param {string} resortId - Resort ID
 * @returns {Object} Resort data
 */
function getResortById(resortId) {
  return skiResorts.find(resort => resort.id === resortId);
}

/**
 * Get all resorts
 * @returns {Array} All ski resorts
 */
function getAllResorts() {
  return skiResorts;
}

/**
 * Get resorts for user's country, sorted by distance
 * @param {string} ip - User's IP address
 * @returns {Array} Resorts in same country with distance
 */
function getCountryResortsByDistance(ip) {
  const location = getLocationFromIP(ip);
  if (!location || !location.country) {
    return getNearestResorts(ip, 10);
  }

  const countryResorts = getResortsByCountry(location.country);
  const withDistance = attachDistance(countryResorts, ip);

  return withDistance.sort((a, b) => {
    if (a.distance === null) return 1;
    if (b.distance === null) return -1;
    return a.distance - b.distance;
  });
}

module.exports = {
  getLocationFromIP,
  getNearestResorts,
  getResortsByCountry,
  getResortById,
  getAllResorts,
  calculateDistance,
  attachDistance,
  getCountryResortsByDistance
};
