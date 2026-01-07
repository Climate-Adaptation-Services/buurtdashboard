// in this file all specifications for the dashboard are stored
import {
  DEFAULT_INDICATORS_CONFIG_URL,
  DEFAULT_CSV_DATA_URL,
  DEFAULT_DATA_DOWNLOAD_URL,
  DORDRECHT_INDICATORS_CONFIG_URL,
  DORDRECHT_CSV_DATA_URL,
  DORDRECHT_DATA_DOWNLOAD_URL
} from './datasets';

// Default configuration for the general dashboard
// Note: English translations are applied client-side from src/lib/i18n/indicator-translations.json
export const defaultConfig = {
  dashboardTitle: "Buurtdashboard NL",
  mainColor: "#36575B",
  backgroundColor: "#36575B",
  indicatorsConfigLocation: DEFAULT_INDICATORS_CONFIG_URL,
  neighbourhoodCSVdataLocation: DEFAULT_CSV_DATA_URL,
  dataDownloadLocation: DEFAULT_DATA_DOWNLOAD_URL,
  defaultMunicipality: null,
  sidebarImage: null,
  categoryPath: ''
}

// Dordrecht-specific configuration
// Note: Currently using default styling. Original Dordrecht styling commented below for reference.
export const dordrechtConfig = {
  dashboardTitle: "Buurtdashboard Dordrecht",
  mainColor: "#36575B",           // Original: "#0064af"
  backgroundColor: "#36575B",     // Original: "#C4C4C4"
  indicatorsConfigLocation: DORDRECHT_INDICATORS_CONFIG_URL,
  neighbourhoodCSVdataLocation: DORDRECHT_CSV_DATA_URL,
  dataDownloadLocation: DORDRECHT_DATA_DOWNLOAD_URL,
  defaultMunicipality: "GM0505",
  sidebarImage: null,             // Original: "./dord3.png"
  categoryPath: ''                // Original: '-dordrecht'
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
