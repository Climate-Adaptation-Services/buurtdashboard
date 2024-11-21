import { huidigeCodeAfkorting } from "$lib/stores"
import { get } from "svelte/store"

export function getClassName(feature, type, indicator, mapType){
  let className = feature.properties[get(huidigeCodeAfkorting)] + "_" + type
  if(mapType !== 'main map'){className += '_' + indicator.attribute}
  
  return className.replaceAll(' ','').replaceAll('(','').replaceAll(')','')
}