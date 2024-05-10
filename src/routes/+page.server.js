import { dsv } from 'd3'

export async function load(){
  const metadata = await dsv(';', "https://gist.githubusercontent.com/stichtingcas/7310a1fbb0e7b2efe841890282a2487f/raw/97684d4270279c2cf8e482fc622afda7fddc7ca1/metadata.csv")

  return { metadata };
}
