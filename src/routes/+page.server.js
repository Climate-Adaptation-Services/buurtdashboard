import { dsv } from 'd3'

export async function load(){
  const metadata = await dsv(';', "https://gist.githubusercontent.com/stichtingcas/7310a1fbb0e7b2efe841890282a2487f/raw/1b52d41478664345dcf14530bf7df7eac2076d5e/metadata.csv")

  return { metadata };
}
