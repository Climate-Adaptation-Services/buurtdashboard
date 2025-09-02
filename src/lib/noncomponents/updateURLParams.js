import { URLParams } from "$lib/stores";
import { get } from "svelte/store";

function sendPostMessage(message, data) {
  // Only send postMessage if we're actually in an iframe (not standalone)
  if (window.parent !== window) {
    try {
      window.parent.postMessage({ type: message, params: data }, "*");
    } catch (error) {
      // Silently ignore postMessage errors in development
      if (import.meta.env.DEV) {
        console.log("PostMessage failed (likely running standalone)");
      }
    }
  }
}

export function addURLParameter(){
  window.history.pushState(null, '', '?' + get(URLParams).toString());
  sendPostMessage("urlUpdate", get(URLParams).toString());
}

export function removeURLParameter(){
  window.history.replaceState(null, '', '?' + get(URLParams).toString());
  sendPostMessage("urlUpdate", get(URLParams).toString());
}