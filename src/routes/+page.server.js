import { dsv } from 'd3'

export async function load(){
  const metadata = await dsv(';', "https://gist.githubusercontent.com/stichtingcas/7310a1fbb0e7b2efe841890282a2487f/raw/41d7b9de32c487457f5555d918b89135ba31ca3a/metadata.csv")

  return { metadata };
}
