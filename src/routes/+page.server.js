import { dsv } from 'd3'

export async function load(){
  const metadata = await dsv(';', "https://gist.githubusercontent.com/stichtingcas/7310a1fbb0e7b2efe841890282a2487f/raw/24ca840c6d466a1933139b7e86d7f80e5f6de757/metadata.csv")

  return { metadata };
}
