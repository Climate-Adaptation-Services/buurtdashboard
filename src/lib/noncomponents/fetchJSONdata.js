import { unzipSync, strFromU8 } from 'fflate';

export const fetchJSONdata = async () => {
  const response = await Promise.all([
    fetch('https://raw.githubusercontent.com/Climate-Adaptation-Services/buurtdashboard-data/main/GemeenteGrenzen2023-small.json'),
    fetch('https://buurtdashboard-data.s3.eu-north-1.amazonaws.com/buurtdashboard-KEA/geojsondata/Buurt2024BuurtdashboardDataset20250425.json.zip'),
    // fetch('https://buurtdashboard-data.s3.eu-north-1.amazonaws.com/buurtdashboard-KEA/geojsondata/Buurt2024BuurtdashboardDataset20250425.fgb'),

  ]);

  const json1 = await response[0].json();
  const zipBuffer = await response[1].arrayBuffer();
  const files = unzipSync(new Uint8Array(zipBuffer));
  const fileName = Object.keys(files).find(name => name.endsWith('.json'));
  const jsonText = strFromU8(files[fileName]);
  const json2 = JSON.parse(jsonText);


  // // Load FlatGeobuf data
  // const fgbBuffer = await response[2].arrayBuffer();

  // // Parse FGB into GeoJSON features
  // const features = [];
  // for await (const feature of deserialize(fgbBuffer)) {
  //   features.push(feature);
  // }

  // // Wrap into a GeoJSON FeatureCollection
  // const jsontest = {
  //   type: "FeatureCollection",
  //   features: features
  // };

  // console.log('jsontest', jsontest)

  return [json1, json2];
};