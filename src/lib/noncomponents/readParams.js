import { URLParams } from "$lib/stores"

export default function(){
  URLParams.set(new URLSearchParams(window.location.search))
  console.log($URLParams.get("gemeente"), $URLParams.get("buurt"))
  gemeenteSelection.set($URLParams.get("gemeente"))
  buurtSelection.set($URLParams.get("buurt"))
}
