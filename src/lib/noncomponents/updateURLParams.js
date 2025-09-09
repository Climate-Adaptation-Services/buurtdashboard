import { URLParams } from "$lib/stores";
import { get } from "svelte/store";

function sendPostMessage(message, data) {
  // Only send postMessage if we're actually in an iframe (not standalone)
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
      // Silently handle postMessage errors
      if (import.meta.env.DEV) {
        console.log("PostMessage failed:", error);
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