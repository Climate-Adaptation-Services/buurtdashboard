import { unzipSync, strFromU8 } from 'fflate';

export const fetchJSONdata = async () => {
  const response = await Promise.all([
    fetch('https://raw.githubusercontent.com/Climate-Adaptation-Services/buurtdashboard-data/main/GemeenteGrenzen2023-small.json'),
    fetch('https://buurtdashboard-data.s3.eu-north-1.amazonaws.com/buurtdashboard-KEA/geojsondata/Buurt2024BuurtdashboardDataset20250416.json.zip'),
  ]);

  const json1 = await response[0].json();
  const zipBuffer = await response[1].arrayBuffer();
  const files = unzipSync(new Uint8Array(zipBuffer));
  const fileName = Object.keys(files).find(name => name.endsWith('.json'));
  const jsonText = strFromU8(files[fileName]);
  const json2 = JSON.parse(jsonText);

  return [json1, json2];
};