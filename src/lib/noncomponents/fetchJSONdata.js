export const fetchJSONdata = (async () => {
  const response = await Promise.all([
    fetch('https://raw.githubusercontent.com/Climate-Adaptation-Services/buurtdashboard-data/main/GemeenteGrenzen2023-small.json'),
    fetch('https://buurtdashboard-data.s3.eu-north-1.amazonaws.com/buurtdashboard-KEA/geojsondata/Buurt2024BuurtdashboardDataset20250416.json'),
    // fetch('https://buurtdashboard-data.s3.eu-north-1.amazonaws.com/buurtdashboard-KEA/geojsondata/output2.json'),

  ])
  return [await response[0].json(), await response[1].json()]
})