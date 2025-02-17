import { URLParams } from "$lib/stores";

export function loadURLParamsFromPostMessage(){
  // Send a message to the parent window asking for the parent URL
  window.parent.postMessage({message:"Requesting parent URL"}, "https://www.klimaateffectatlas.nl");

  // Listen for a message from the parent with the parent's URL
  window.addEventListener("message", (event) => {
    if (event.origin === "https://www.klimaateffectatlas.nl") {
      console.log("Received URL from parent:", event.data.parentURL);
      URLParams.set(new URLSearchParams('?' + event.data.parentURL.split('?')[1]))
    } else {
      console.error("Received message from an untrusted origin:", event.origin);
    }
  });
}