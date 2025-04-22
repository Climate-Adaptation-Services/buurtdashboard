import { jaarSelecties } from "$lib/stores"
import { get } from "svelte/store"

export function getIndicatorAttribute(indicator, attribute) {
  if (get(jaarSelecties)[indicator.title]) {
    return attribute + get(jaarSelecties)[indicator.title]
  } else {
    return attribute
  }
}