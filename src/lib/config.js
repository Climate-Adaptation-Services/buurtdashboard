// in this file all specifications for the dashboard are stored
// NOTE: CSV data URLs and download URLs are now fetched from Config Portal
// The indicatorsConfigLocation is kept for backwards compatibility but Config Portal is preferred
import {
  DEFAULT_INDICATORS_CONFIG_URL,
  DORDRECHT_INDICATORS_CONFIG_URL
} from './datasets';

// Default configuration for the general dashboard
// Note: English translations are applied client-side from src/lib/i18n/indicator-translations.json
// Note: neighbourhoodCSVdataLocation and dataDownloadLocation come from Config Portal
export const defaultConfig = {
  dashboardTitle: "Buurtdashboard NL",
  mainColor: "#36575B",
  backgroundColor: "#36575B",
  indicatorsConfigLocation: DEFAULT_INDICATORS_CONFIG_URL,
  neighbourhoodCSVdataLocation: null, // Fetched from Config Portal
  dataDownloadLocation: null,         // Fetched from Config Portal
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
  neighbourhoodCSVdataLocation: null, // Fetched from Config Portal
  dataDownloadLocation: null,         // Fetched from Config Portal
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
