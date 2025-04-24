import { AHNSelecties } from "$lib/stores"
import { get } from "svelte/store"

export function getIndicatorAttribute(indicator, attribute) {
  if (get(AHNSelecties)[indicator.title]) {
    return attribute + get(AHNSelecties)[indicator.title]
  } else {
    return attribute
  }
}