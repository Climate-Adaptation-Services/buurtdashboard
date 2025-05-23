// in this file all specifications for the dashboard are stored

// Default configuration for the general dashboard
export const defaultConfig = {
  dashboardTitle: "Buurtdashboard NL",
  backgroundColor: "#36575B",
  metadataLocation: "https://buurtdashboard-data.s3.eu-north-1.amazonaws.com/buurtdashboard-KEA/metadata/buurtdashboard-metadata-170425-02.csv",
  metadataLocationEnglish: "https://buurtdashboard-data.s3.eu-north-1.amazonaws.com/buurtdashboard-KEA/metadata/buurtdashboard-engels-metadata-060125-04.csv",
  municipalityJSONdataLocation: "https://raw.githubusercontent.com/Climate-Adaptation-Services/buurtdashboard-data/main/GemeenteGrenzen2023-small.json",
  neighbourhoodJSONdataLocation: "https://buurtdashboard-data.s3.eu-north-1.amazonaws.com/buurtdashboard-KEA/geojsondata/Buurt2024BuurtdashboardDataset20250425.json.zip",
  defaultMunicipality: null,
  sidebarImage: null,
}

// Dordrecht-specific configuration
export const dordrechtConfig = {
  dashboardTitle: "Buurtdashboard Dordrecht",
  backgroundColor: "#0064af",
  metadataLocation: "https://buurtdashboard-data.s3.eu-north-1.amazonaws.com/buurtdashboard-KEA/metadata/buurtdashboard-metadata-170425-02.csv",
  metadataLocationEnglish: "https://buurtdashboard-data.s3.eu-north-1.amazonaws.com/buurtdashboard-KEA/metadata/buurtdashboard-engels-metadata-060125-04.csv",
  municipalityJSONdataLocation: "https://raw.githubusercontent.com/Climate-Adaptation-Services/buurtdashboard-data/main/GemeenteGrenzen2023-small.json",
  neighbourhoodJSONdataLocation: "https://buurtdashboard-data.s3.eu-north-1.amazonaws.com/buurtdashboard-KEA/geojsondata/Buurt2024BuurtdashboardDataset20250425.json.zip",
  defaultMunicipality: "GM0505",
  sidebarImage: "./dord3.png",
}




// Function to apply theme variables from config to CSS
export function applyThemeVariables(configObj) {
  if (typeof document !== 'undefined' && configObj) {
    document.documentElement.style.setProperty('--background-color', configObj.backgroundColor);
  }
}
