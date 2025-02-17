import { URLParams } from "$lib/stores";
import { get } from "svelte/store";

export function addURLParameter(){
  window.history.pushState(null, '', '?' + get(URLParams).toString());
  window.parent.postMessage("Update URL params", '?' + get(URLParams).toString());
}

export function removeURLParameter(){
  window.history.replaceState(null, '', '?' + get(URLParams).toString());
  window.parent.postMessage("Update URL params", '?' + get(URLParams).toString());
}