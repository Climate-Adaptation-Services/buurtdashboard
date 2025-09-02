import { URLParams } from "$lib/stores";
import { processURLParameters } from "./processURLParameters.js";

export function loadURLParamsFromPostMessage(){
  // Only send postMessage if we're actually in an iframe (not standalone)
  if (window.parent !== window) {
    try {
      // Send a message to the parent window asking for the parent URL
      window.parent.postMessage({ message: "Requesting parent URL" }, "*");
    } catch (error) {
      // Silently ignore postMessage errors in development
      if (import.meta.env.DEV) {
        console.log("PostMessage not available (likely running standalone)");
      }
    }
  }

  // Listen for a message from the parent with the parent's URL
  window.addEventListener("message", (event) => {
    const trustedOrigins = [
      "https://www.klimaateffectatlas.nl",
      "https://klimaateffectatlas.nl",
      "http://localhost:5173", // For local development
      "http://localhost:4173", // For preview builds
      "http://127.0.0.1:5173"  // Alternative localhost
    ];
    
    if (trustedOrigins.includes(event.origin) || import.meta.env.DEV) {
      // Validate that we have the expected data structure - parent sends { parentURL: "..." }
      if (event.data && event.data.parentURL && typeof event.data.parentURL === 'string') {
        console.log("Received URL from parent:", event.data.parentURL);
        const urlParts = event.data.parentURL.split('?');
        if (urlParts.length > 1) {
          URLParams.set(new URLSearchParams('?' + urlParts[1]));
          // Process the new URL parameters
          processURLParameters();
        }
      } else {
        if (import.meta.env.DEV) {
          // Filter out known non-relevant messages (devtools, etc)
          if (event.data && (event.data.source === "react-devtools-content-script" || 
                            event.data.source === "react-devtools-bridge" ||
                            event.data.hello)) {
            return; // Ignore devtools messages
          }
          console.log("Received message from parent but no valid parentURL:", event.data);
        }
      }
    } else {
      // Only log in development to avoid console spam
      if (import.meta.env.DEV) {
        console.warn("Received message from untrusted origin:", event.origin);
      }
    }
  });
}