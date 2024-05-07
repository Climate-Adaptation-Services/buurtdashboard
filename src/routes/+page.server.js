import { dsv } from 'd3'

export async function load(){
  const metadata = await dsv(';', "https://gist.githubusercontent.com/stichtingcas/7310a1fbb0e7b2efe841890282a2487f/raw/4d2f007e28eca28dff8e6bf1bbd85f712f9f5406/metadata.csv")

  return { metadata };
}
