import { dsv } from 'd3'

export async function load(){
  const metadata = await dsv(';', "https://gist.githubusercontent.com/stichtingcas/7310a1fbb0e7b2efe841890282a2487f/raw/8f5694eeb52f576fa2c5ad567819e2fc01997b33/metadata.csv")

  return { metadata };
}
