import { dsv } from 'd3'

export async function load(){
  const metadata = await dsv(';', "https://raw.githubusercontent.com/Climate-Adaptation-Services/buurtdashboard-data/main/metadata.csv")

  return { metadata };
}
