import { dsv } from 'd3'

export async function load(){
  const metadata = await dsv(';', "https://gist.githubusercontent.com/stichtingcas/7310a1fbb0e7b2efe841890282a2487f/raw/af3c61d62db5a20885cc90c207ede0ce91fd0f4a/metadata.csv")

  return { metadata };
}
