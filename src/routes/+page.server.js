import { dsv } from 'd3'

export async function load(){
  const metadata = await dsv(';', "https://gist.githubusercontent.com/stichtingcas/7310a1fbb0e7b2efe841890282a2487f/raw/2e528f8e61994f0083aac5689b1a6153334a824f/metadata.csv")

  return { metadata };
}
