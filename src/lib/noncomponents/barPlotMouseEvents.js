import { getRegionName } from "./getRegionName.js";
import { tooltipValues, tooltipRegion, municipalitySelection } from "$lib/stores";
import { select } from "d3";
import { get } from "svelte/store";
import { getIndicatorAttribute } from "./getIndicatorAttribute.js";

export function barPlotMouseOver(indicator, indicatorValueColorscale, st, stacked) {
  tooltipValues.set({
    indicator: stacked.key,
    value: Math.round((st[1] - st[0]) * 100) / 100 + '%',
    color: indicatorValueColorscale(stacked.key)
  })

  let elem = document.getElementsByClassName('barplot_rect' + indicator.attribute + stacked.key.replaceAll(' ', '').replaceAll('>', '') + st.data.group)[0]
  let rectmap = elem.getBoundingClientRect();
  let tooltipCenter = [rectmap.left, rectmap.top]

  tooltipRegion.set({
    'region': (get(municipalitySelection) === null) ? 'Gemeente' : 'Buurt',
    'center': tooltipCenter,
    'name': getRegionName(st.data.group)
  })
}

export function barPlotMouseOut(indicator, st, stacked) {
  select('.' + 'barplot_rect' + indicator.attribute + stacked.key.replaceAll(' ', '').replaceAll('>', '') + st.data.group)
    .attr('stroke', 'none')

  tooltipValues.set(null)

  tooltipRegion.set(null)
}