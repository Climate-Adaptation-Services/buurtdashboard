import { dsv } from 'd3'

export async function load(){
  const metadata = await dsv(';', "https://gist.githubusercontent.com/stichtingcas/7310a1fbb0e7b2efe841890282a2487f/raw/88cd677ce153e0f04dcbc332f07c8ad3def6051e/metadata.csv")

  return { metadata };
}
