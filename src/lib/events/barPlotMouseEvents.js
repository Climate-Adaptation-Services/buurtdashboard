import { getRegionName } from "../utils/getRegionName.js";
import { tooltipValues, tooltipRegion, municipalitySelection } from "$lib/stores";
import { select } from "d3";
import { get } from "svelte/store";

// Helper function to sanitize class names for use in CSS selectors
function sanitizeClassName(str) {
  return str
    .replaceAll(' ', '')
    .replaceAll(',', '_')
    .replaceAll('/', '_')
    .replaceAll('(', '')
    .replaceAll(')', '')
    .replaceAll(':', '')  // Remove colons
    .replaceAll('>', '')
    .replaceAll('%', '')  // Remove percent signs
}

export function barPlotMouseOver(indicator, indicatorValueColorscale, st, stacked) {
  const percentageValue = st[1] - st[0]
  const displayValue = Math.round(percentageValue * 100) / 100

  tooltipValues.set({
    indicator: stacked.key,
    value: displayValue + '%',
    color: indicatorValueColorscale(stacked.key)
  })

  const className = 'barplot_rect' + sanitizeClassName(indicator.title) + sanitizeClassName(stacked.key) + st.data.group
  let elem = document.getElementsByClassName(className)[0]

  if (!elem) return // Guard against missing element

  let rectmap = elem.getBoundingClientRect();
  let tooltipCenter = [rectmap.left, rectmap.top]

  tooltipRegion.set({
    'region': (get(municipalitySelection) === null) ? 'Gemeente' : 'Buurt',
    'center': tooltipCenter,
    'name': getRegionName(st.data.group)
  })
}

export function barPlotMouseOut(indicator, st, stacked) {
  const className = 'barplot_rect' + sanitizeClassName(indicator.title) + sanitizeClassName(stacked.key) + st.data.group

  select('.' + className)
    .attr('stroke', 'none')

  tooltipValues.set(null)

  tooltipRegion.set(null)
}