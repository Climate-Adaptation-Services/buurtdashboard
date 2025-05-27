import { URLParams, municipalitySelection, neighbourhoodSelection, indicatorsSelection, configStore } from "$lib/stores"
import { get } from 'svelte/store';
import { defaultConfig, dordrechtConfig } from "$lib/config";

export function processURLParameters() {
  // Get the config parameter from URL
  const configParam = get(URLParams).get("config") || "default";

  // Set the actual config object in the configStore
  setTimeout(() => {
    if (configParam === "dordrecht") {
      configStore.set(dordrechtConfig);
    } else {
      configStore.set(defaultConfig);
    }
  }, 10);

  let gemeente = ''
  setTimeout(() => { gemeente = get(URLParams).get("gemeente") || get(configStore).defaultMunicipality; }, 10)
  setTimeout(() => { municipalitySelection.set(gemeente) }, 10)
  setTimeout(() => { neighbourhoodSelection.set(get(URLParams).get("buurt")) }, 10)
  setTimeout(() => { indicatorsSelection.set(get(URLParams).getAll("indicator")) }, 10)
}