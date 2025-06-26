// in this file all specifications for the dashboard are stored
import {
  DEFAULT_METADATA_URL,
  DEFAULT_METADATA_ENGLISH_URL,
  DEFAULT_CSV_DATA_URL,
  DORDRECHT_METADATA_URL,
  DORDRECHT_METADATA_ENGLISH_URL,
  DORDRECHT_CSV_DATA_URL
} from './datasets';

// Default configuration for the general dashboard
export const defaultConfig = {
  dashboardTitle: "Buurtdashboard NL",
  mainColor: "#36575B",
  backgroundColor: "#36575B",
  metadataLocation: DEFAULT_METADATA_URL,
  metadataLocationEnglish: DEFAULT_METADATA_ENGLISH_URL,
  neighbourhoodCSVdataLocation: DEFAULT_CSV_DATA_URL,
  defaultMunicipality: null,
  sidebarImage: null,
}

// Dordrecht-specific configuration
export const dordrechtConfig = {
  dashboardTitle: "Buurtdashboard Dordrecht",
  mainColor: "#0064af",
  backgroundColor: "#C4C4C4",
  metadataLocation: DORDRECHT_METADATA_URL,
  metadataLocationEnglish: DORDRECHT_METADATA_ENGLISH_URL,
  neighbourhoodCSVdataLocation: DORDRECHT_CSV_DATA_URL,
  defaultMunicipality: "GM0505",
  sidebarImage: "./dord3.png",
}

// Function to apply theme variables from config to CSS
function applyThemeVariables(configObj) {
  if (typeof document !== 'undefined' && configObj) {
    document.documentElement.style.setProperty('--main-color', configObj.mainColor);
    document.documentElement.style.setProperty('--background-color', configObj.backgroundColor);
  }
}

// This function will be called from stores.js to set up the subscription
export function setupThemeSubscription(store) {
  store.subscribe(config => {
    applyThemeVariables(config);
  });
}
