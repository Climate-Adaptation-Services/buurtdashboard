/**
 * Consolidated URL Management Module
 * Combines URL parameter handling, PostMessage communication, and URL processing
 */

import { URLParams, municipalitySelection, neighbourhoodSelection, indicatorsSelection, configStore } from "$lib/stores";
import { get } from "svelte/store";
import { defaultConfig, dordrechtConfig } from "$lib/config";

// Constants
const TRUSTED_ORIGINS = [
  "https://www.klimaateffectatlas.nl",
  "https://klimaateffectatlas.nl",
  "http://localhost:5173",
  "http://localhost:4173",
  "http://127.0.0.1:5173"
];

// Store the parent's path (including language prefix) to preserve it when sending updates
let parentPath = '/buurtdashboard'; // Default fallback

/**
 * Send PostMessage to parent window (when in iframe)
 */
function sendPostMessage(message, data) {
  if (window.parent !== window) {
    try {
      let messageData;
      if (message === "urlUpdate") {
        messageData = { message: 'Update URL params', urlparams: parentPath + '?' + data };
      } else if (message === "requestParentURL") {
        messageData = { message: 'Requesting parent URL' };
      }
      window.parent.postMessage(messageData, "*");
    } catch (error) {
      if (import.meta.env.DEV) {
        console.log("PostMessage failed:", error);
      }
    }
  }
}

/**
 * Add URL parameter to browser history and notify parent
 */
export function addURLParameter() {
  const urlString = get(URLParams).toString();
  window.history.pushState(null, '', '?' + urlString);
  sendPostMessage("urlUpdate", urlString);
}

/**
 * Replace URL parameter in browser history and notify parent
 */
export function removeURLParameter() {
  window.history.replaceState(null, '', '?' + get(URLParams).toString());
  sendPostMessage("urlUpdate", get(URLParams).toString());
}

/**
 * Process URL parameters and update stores
 * Note: Only call this after allNeighbourhoodsJSONData is loaded
 * Note: configStore is now set by +page.svelte with portal URLs, we preserve those URLs
 *       when switching between default and dordrecht configs
 */
export function processURLParameters() {
  const configParam = get(URLParams).get("config") || "default";

  // Update config while preserving portal URLs that were set by +page.svelte
  setTimeout(() => {
    const currentConfig = get(configStore);
    const baseConfig = configParam === "dordrecht" ? dordrechtConfig : defaultConfig;

    // Merge: use base config but preserve portal URLs if they were set
    configStore.set({
      ...baseConfig,
      // Preserve portal URLs (they take precedence over local fallbacks)
      neighbourhoodCSVdataLocation: currentConfig.neighbourhoodCSVdataLocation || baseConfig.neighbourhoodCSVdataLocation,
      dataDownloadLocation: currentConfig.dataDownloadLocation || baseConfig.dataDownloadLocation
    });
  }, 10);

  // Update other parameters - sequential to avoid race conditions
  setTimeout(() => {
    const gemeente = get(URLParams).get("gemeente") || get(configStore).defaultMunicipality;
    const buurt = get(URLParams).get("buurt");
    const indicators = get(URLParams).getAll("indicator");

    // Set municipality first, then neighborhood (order matters for derived stores)
    if (gemeente) {
      municipalitySelection.set(gemeente);
    }
    if (buurt) {
      neighbourhoodSelection.set(buurt);
    }
    if (indicators.length > 0) {
      indicatorsSelection.set(indicators);
    }
  }, 10);
}

/**
 * Request URL parameters from parent window (when in iframe)
 */
export function requestParentURL() {
  if (window.parent !== window) {
    try {
      window.parent.postMessage({ message: "Requesting parent URL" }, "*");
    } catch (error) {
      if (import.meta.env.DEV) {
        console.log("PostMessage not available (likely running standalone)");
      }
    }
  }
}

/**
 * Set up PostMessage listener for parent URL updates
 */
export function setupURLListener() {
  window.addEventListener("message", (event) => {
    // Check trusted origins
    if (TRUSTED_ORIGINS.includes(event.origin) || import.meta.env.DEV) {
      // Validate expected data structure
      if (event.data && event.data.parentURL && typeof event.data.parentURL === 'string') {
        // Extract the full URL to get the path (including language prefix like /nl/)
        try {
          const url = new URL(event.data.parentURL);
          parentPath = url.pathname; // Store path like "/nl/buurtdashboard"
        } catch (e) {
          if (import.meta.env.DEV) {
            console.warn('Failed to parse parent URL, using default path');
          }
        }

        const urlParts = event.data.parentURL.split('?');
        if (urlParts.length > 1) {
          const newParams = new URLSearchParams('?' + urlParts[1]);
          URLParams.set(newParams);
          processURLParameters();
        }
      } else {
        if (import.meta.env.DEV) {
          // Filter out known non-relevant messages
          if (event.data && (
            event.data.source === "react-devtools-content-script" ||
            event.data.source === "react-devtools-bridge" ||
            event.data.hello
          )) {
            return; // Ignore devtools messages
          }
          console.log("Received message from parent but no valid parentURL:", event.data);
        }
      }
    } else {
      if (import.meta.env.DEV) {
        console.warn("Received message from untrusted origin:", event.origin);
      }
    }
  });
}

/**
 * Initialize URL management (combines loadURLParamsFromPostMessage functionality)
 */
export function initializeURLManagement() {
  requestParentURL();
  setupURLListener();
}