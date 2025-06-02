// in this file all specifications for the dashboard are stored

// Default configuration for the general dashboard
export const defaultConfig = {
  dashboardTitle: "Buurtdashboard NL",
  mainColor: "#36575B",
  backgroundColor: "#36575B",
  metadataLocation: "https://buurtdashboard-data.s3.eu-north-1.amazonaws.com/buurtdashboard-KEA/metadata/buurtdashboard-metadata-170425-02.csv",
  metadataLocationEnglish: "https://buurtdashboard-data.s3.eu-north-1.amazonaws.com/buurtdashboard-KEA/metadata/buurtdashboard-engels-metadata-060125-04.csv",
  neighbourhoodCSVdataLocation: "https://buurtdashboard-data.s3.eu-north-1.amazonaws.com/buurtdashboard-KEA/csvdata/BuurtdashboardDataDownload20250425.csv.zip",
  defaultMunicipality: null,
  sidebarImage: null,
}

// Dordrecht-specific configuration
export const dordrechtConfig = {
  dashboardTitle: "Buurtdashboard Dordrecht",
  mainColor: "#0064af",
  backgroundColor: "#C4C4C4",
  metadataLocation: "https://buurtdashboard-data.s3.eu-north-1.amazonaws.com/dordrecht-rmk/metadata/metadata_020625_2023_1.csv",
  metadataLocationEnglish: "https://buurtdashboard-data.s3.eu-north-1.amazonaws.com/dordrecht-rmk/metadata/metadata_020625_2023_1.csv",
  neighbourhoodCSVdataLocation: "https://buurtdashboard-data.s3.eu-north-1.amazonaws.com/dordrecht/csvdata/Dordrecht_dashboard_260525_1.csv.zip",
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
