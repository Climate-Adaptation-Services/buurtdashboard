import { URLParams } from "$lib/stores";

export function loadURLParamsFromPostMessage(){
  // Only send postMessage if we're actually in an iframe (not standalone)
  if (window.parent !== window) {
    try {
      // Send a message to the parent window asking for the parent URL
      window.parent.postMessage("Requesting parent URL", "https://www.klimaateffectatlas.nl");
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
    
    if (trustedOrigins.includes(event.origin)) {
      console.log("Received URL from parent:", event.data.parentURL);
      URLParams.set(new URLSearchParams('?' + event.data.parentURL.split('?')[1]))
    } else {
      // Only log in development to avoid console spam
      if (import.meta.env.DEV) {
        console.warn("Received message from untrusted origin:", event.origin);
      }
    }
  });
}