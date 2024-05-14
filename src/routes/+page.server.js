import { dsv } from 'd3'

export async function load(){
  const metadata = await dsv(';', "https://gist.githubusercontent.com/stichtingcas/7310a1fbb0e7b2efe841890282a2487f/raw/45bb716b68a6a4add47b46cbb4dc4515a7df7bfc/metadata.csv")

  return { metadata };
}
