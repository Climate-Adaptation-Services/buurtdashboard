import { URLParams, gemeenteSelection, buurtSelection, indicatorenSelectie } from "$lib/stores"
import { get } from 'svelte/store';

export function readURLParameters(){    
  setTimeout(() => {gemeenteSelection.set(get(URLParams).get("gemeente"))}, 10)
  setTimeout(() => {buurtSelection.set(get(URLParams).get("buurt"))}, 10)
  setTimeout(() => {indicatorenSelectie.set(get(URLParams).getAll("indicator"))}, 10)
}