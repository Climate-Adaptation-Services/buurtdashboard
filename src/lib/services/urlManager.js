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

/**
 * Send PostMessage to parent window (when in iframe)
 */
function sendPostMessage(message, data) {
  if (window.parent !== window) {
    try {
      let messageData;
      if (message === "urlUpdate") {
        messageData = { message: 'Update URL params', urlparams: '/buurtdashboard?' + data };
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
  window.history.pushState(null, '', '?' + get(URLParams).toString());
  sendPostMessage("urlUpdate", get(URLParams).toString());
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
 */
export function processURLParameters() {
  const configParam = get(URLParams).get("config") || "default";

  // Set the config object in the configStore
  setTimeout(() => {
    if (configParam === "dordrecht") {
      configStore.set(dordrechtConfig);
    } else {
      configStore.set(defaultConfig);
    }
  }, 10);

  // Update other parameters - sequential to avoid race conditions
  setTimeout(() => {
    const gemeente = get(URLParams).get("gemeente") || get(configStore).defaultMunicipality;
    const buurt = get(URLParams).get("buurt");
    const indicators = get(URLParams).getAll("indicator");

    // Debug logging for indicator params (production-visible)
    console.log('📊 processURLParameters - indicators from URL:', indicators);

    // Set municipality first, then neighborhood (order matters for derived stores)
    if (gemeente) {
      municipalitySelection.set(gemeente);
    }
    if (buurt) {
      neighbourhoodSelection.set(buurt);
    }
    if (indicators.length > 0) {
      indicatorsSelection.set(indicators);
      console.log('📊 Set indicatorsSelection store to:', indicators);

      // Verify the store was actually set
      setTimeout(() => {
        const currentSelection = get(indicatorsSelection);
        console.log('📊 indicatorsSelection store after 100ms:', currentSelection);
        if (JSON.stringify(currentSelection) !== JSON.stringify(indicators)) {
          console.warn('⚠️ indicatorsSelection was modified after being set!');
          console.warn('   Expected:', indicators);
          console.warn('   Got:', currentSelection);
        }
      }, 100);
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
        // Production-visible logging to debug indicator issue
        console.log("📨 Received URL from parent:", event.data.parentURL);

        const urlParts = event.data.parentURL.split('?');
        if (urlParts.length > 1) {
          const queryString = urlParts[1];
          console.log("📨 Query string:", queryString);

          // Parse and log all parameters
          const params = new URLSearchParams('?' + queryString);
          const indicators = params.getAll('indicator');
          console.log("📨 Indicators in parent URL:", indicators);

          URLParams.set(new URLSearchParams('?' + queryString));
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