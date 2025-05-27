import { unzipSync, strFromU8 } from 'fflate';

export const fetchJSONdata = async () => {
  // Hardcoded URLs instead of getting from config
  const MUNICIPALITY_JSON_URL = "https://raw.githubusercontent.com/Climate-Adaptation-Services/buurtdashboard-data/main/GemeenteGrenzen2023-small.json";
  const NEIGHBOURHOOD_JSON_URL = "https://buurtdashboard-data.s3.eu-north-1.amazonaws.com/buurtdashboard-KEA/geojsondata/Buurt2024BuurtdashboardDataset20250425.json.zip";

  const response = await Promise.all([
    fetch(MUNICIPALITY_JSON_URL),
    fetch(NEIGHBOURHOOD_JSON_URL),
    // fetch('https://buurtdashboard-data.s3.eu-north-1.amazonaws.com/buurtdashboard-KEA/geojsondata/Buurt2024BuurtdashboardDataset20250425.fgb'),

  ]);

  const json1 = await response[0].json();
  const zipBuffer = await response[1].arrayBuffer();
  const files = unzipSync(new Uint8Array(zipBuffer));
  const fileName = Object.keys(files).find(name => name.endsWith('.json'));
  const jsonText = strFromU8(files[fileName]);
  const json2 = JSON.parse(jsonText);

  return [json1, json2];
};