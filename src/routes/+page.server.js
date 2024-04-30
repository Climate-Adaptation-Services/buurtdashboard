import { dsv } from 'd3'

export async function load(){
  const metadata = await dsv(';', "https://gist.githubusercontent.com/stichtingcas/7310a1fbb0e7b2efe841890282a2487f/raw/d2dcc74ddc5997deae05b78155042db866dd1910/metadata.csv")

  return { metadata };
}
