import { URLParams } from "$lib/stores";
import { get } from "svelte/store";

export function addURLParameter(){
  window.history.pushState(null, '', '?' + get(URLParams).toString());
  window.parent.postMessage({message:"Update URL params", urlparams:'?' + get(URLParams).toString()}, "https://www.klimaateffectatlas.nl");
}

export function removeURLParameter(){
  window.history.replaceState(null, '', '?' + get(URLParams).toString());
  window.parent.postMessage({message:"Update URL params", urlparams:'?' + get(URLParams).toString()}, "https://www.klimaateffectatlas.nl");
}