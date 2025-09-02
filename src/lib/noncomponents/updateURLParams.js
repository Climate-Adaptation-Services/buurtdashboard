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
      console.log("Sending postMessage:", messageData);
      window.parent.postMessage(messageData, "*");
    } catch (error) {
      console.log("PostMessage failed:", error);
    }
  } else {
    console.log("Not in iframe, skipping postMessage:", { type: message, params: data });
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