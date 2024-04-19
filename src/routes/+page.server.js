import { dsv } from 'd3'

export async function load(){
  const metadata = await dsv(';', "https://gist.githubusercontent.com/stichtingcas/7310a1fbb0e7b2efe841890282a2487f/raw/193077ab93f912aa27d6d8bc0b58c8908a779a42/metadata.csv")

  return { metadata };
}
