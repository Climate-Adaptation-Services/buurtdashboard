import { dsv } from 'd3'

export async function load(){
  const metadata = await dsv(';', "https://gist.githubusercontent.com/stichtingcas/7310a1fbb0e7b2efe841890282a2487f/raw/3e1f64f904b4512078dc3e1bb361e7fa944b8cb8/metadata.csv")

  return { metadata };
}
