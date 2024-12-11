import { URLParams, municipalitySelection, neighbourhoodSelection, indicatorsSelection } from "$lib/stores"
import { get } from 'svelte/store';

export function processURLParameters(){    
  setTimeout(() => {municipalitySelection.set(get(URLParams).get("gemeente"))}, 10)
  setTimeout(() => {neighbourhoodSelection.set(get(URLParams).get("buurt"))}, 10)
  setTimeout(() => {indicatorsSelection.set(get(URLParams).getAll("indicator"))}, 10)
}