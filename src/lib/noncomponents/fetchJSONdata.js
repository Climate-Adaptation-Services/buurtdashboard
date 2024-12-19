export const fetchJSONdata = (async () => {
  const response = await Promise.all([
    fetch('https://raw.githubusercontent.com/Climate-Adaptation-Services/buurtdashboard-data/main/GemeenteGrenzen2023-small.json'),
    fetch('https://buurtdashboard-data.s3.eu-north-1.amazonaws.com/buurtdashboard-KEA/geojsondata/BuurtenDataset20241218.json'),

    // fetch('https://raw.githubusercontent.com/Climate-Adaptation-Services/buurtdashboard-data/main/BuurtenDataset20240913_xaaaa.json'),
    // fetch('https://raw.githubusercontent.com/Climate-Adaptation-Services/buurtdashboard-data/main/BuurtenDataset20240913_xaaab.json'),
    // fetch('https://raw.githubusercontent.com/Climate-Adaptation-Services/buurtdashboard-data/main/BuurtenDataset20240913_xaaac.json')
  ])
  return [await response[0].json(), await response[1].json()]
})