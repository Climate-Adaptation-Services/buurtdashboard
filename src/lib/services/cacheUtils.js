/**
 * Utility functions for caching TopoJSON data to improve performance
 * Uses the Cache API to store simplified TopoJSON data
 */

const CACHE_NAME = 'buurtdashboard-topojson-cache';
const CACHE_VERSION = '6'; // Increment this when data structure changes - v6: Added null feature filtering
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Generate a cache key for a URL with version
 * @param {string} url - The URL of the TopoJSON data
 * @returns {string} - Cache key
 */
export function generateCacheKey(url) {
  return `${url}?v=${CACHE_VERSION}`;
}

/**
 * Check if the cache entry is expired
 * @param {Object} metadata - Cache metadata
 * @returns {boolean} - True if expired
 */
function isCacheExpired(metadata) {
  if (!metadata || !metadata.timestamp) return true;
  const now = Date.now();
  return (now - metadata.timestamp) > CACHE_EXPIRY;
}

/**
 * Try to get data from cache
 * @param {string} url - The URL to fetch
 * @returns {Promise<Object|null>} - Cached data or null if not found/expired
 */
export async function getFromCache(url) {
  // Skip cache in development mode unless forced
  // Check if we're in a browser environment
  const isBrowser = typeof window !== 'undefined';

  if (import.meta.env.DEV && !(isBrowser && window.FORCE_ENABLE_CACHE)) {
    return null;
  }



  try {
    // Check if Cache API is available (browser environment)
    if (!('caches' in self)) {

      return null;
    }

    const cache = await caches.open(CACHE_NAME);
    const cacheKey = generateCacheKey(url);

    // Get both the data and metadata
    const dataResponse = await cache.match(cacheKey);
    const metadataResponse = await cache.match(`${cacheKey}-metadata`);

    if (!dataResponse || !metadataResponse) {

      return null;
    }

    const metadata = await metadataResponse.json();

    // Check if cache is expired
    if (isCacheExpired(metadata)) {

      // Delete expired cache entries
      await cache.delete(cacheKey);
      await cache.delete(`${cacheKey}-metadata`);
      return null;
    }


    return await dataResponse.json();
  } catch (error) {
    console.error('Error accessing cache:', error);
    return null;
  }
}

/**
 * Save data to cache
 * @param {string} url - The URL that was fetched
 * @param {Object} data - The data to cache
 * @returns {Promise<boolean>} - Success status
 */
export async function saveToCache(url, data) {
  // Skip cache in development mode unless forced
  // Check if we're in a browser environment
  const isBrowser = typeof window !== 'undefined';

  if (import.meta.env.DEV && !(isBrowser && window.FORCE_ENABLE_CACHE)) {
    return false;
  }



  try {
    // Check if Cache API is available
    if (!('caches' in self)) {
      return false;
    }

    const cache = await caches.open(CACHE_NAME);
    const cacheKey = generateCacheKey(url);

    // Create a Response object from the data
    const dataResponse = new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' }
    });

    // Create metadata with timestamp
    const metadata = {
      timestamp: Date.now(),
      url: url
    };

    const metadataResponse = new Response(JSON.stringify(metadata), {
      headers: { 'Content-Type': 'application/json' }
    });

    // Store both the data and metadata
    await cache.put(cacheKey, dataResponse);
    await cache.put(`${cacheKey}-metadata`, metadataResponse);

    console.log(`Cached data for ${url}`);
    return true;
  } catch (error) {
    console.error('Error saving to cache:', error);
    return false;
  }
}

/**
 * Clear all cached TopoJSON data
 * @returns {Promise<boolean>} - Success status
 */
export async function clearCache() {
  try {
    if (!('caches' in self)) {
      return false;
    }

    await caches.delete(CACHE_NAME);
    console.log('Cache cleared');
    return true;
  } catch (error) {
    console.error('Error clearing cache:', error);
    return false;
  }
}
