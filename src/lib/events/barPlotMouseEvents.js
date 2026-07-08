import { getRegionName } from "../utils/getRegionName.js";
import { sanitizeClassName } from "../utils/sanitizeClassName.js";
import { formatDutchNumber } from "../utils/valueRetrieval.js";
import { tooltipValues, tooltipRegion, municipalitySelection } from "$lib/stores";
import { select } from "d3";
import { get } from "svelte/store";

export function barPlotMouseOver(indicator, indicatorValueColorscale, st, stacked) {
  const percentageValue = st[1] - st[0]

  tooltipValues.set({
    indicator: stacked.key,
    value: formatDutchNumber(percentageValue, 1) + '%',
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