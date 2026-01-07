<script>
  import { AHNSelecties, allMunicipalitiesJSONData, configStore, neighbourhoodsInMunicipalityJSONData, tooltipRegion } from "$lib/stores"
  import { afterUpdate } from "svelte"
  import { getIndicatorAttribute } from "$lib/utils/getIndicatorAttribute"
  import { t } from "$lib/i18n/translate.js"

  export let indicator
  export let graphWidth

  let indicatorInfoPosition
  let isRightmost = false

  afterUpdate(() => {
    const className = "indicator-info-" + indicator.title.replaceAll(' ', '').replaceAll(',', '_').replaceAll('/', '_').replaceAll('(', '').replaceAll(')', '').replaceAll('|', '_')
    const infoElement = document.getElementsByClassName(className)[0]
    if (!infoElement) return

    const rect = infoElement.getBoundingClientRect()
    const spaceToRight = window.innerWidth - rect.right

    // If there's less than 310px space to the right (tooltip width 300px + small margin),
    // indicator is rightmost -> position tooltip flush with RIGHT edge (overlapping)
    // Otherwise -> position tooltip to the right of indicator (not overlapping)
    isRightmost = spaceToRight < 310

    // Get the actual indicator element width from the DOM
    const indicatorElement = infoElement.closest('.indicator-div')
    const indicatorRect = indicatorElement ? indicatorElement.getBoundingClientRect() : null
    const actualIndicatorWidth = indicatorRect ? indicatorRect.width : (graphWidth || 400)

    // Position flush with indicator borders:
    // - If rightmost: position at left edge (0px) flush with left side
    // - If not rightmost: position at indicator's right edge (actualIndicatorWidth) to be flush
    const tooltipWidth = 300
    indicatorInfoPosition = isRightmost ? 0 : actualIndicatorWidth
  })

  function handleCategoryMouseOver(e) {
    tooltipRegion.set({
      'region': t('Categorie'),
      'center': [e.clientX, e.clientY],
      'name': indicator.category
    })
  }

  function handleCategoryMouseOut() {
    tooltipRegion.set(null)
  }
</script>

<h3 class="question-mark" style="background-color:{$configStore.mainColor}">i</h3>
<!-- <h3 class="category" style="background-color:{$configStore.mainColor}">C</h3> -->
<img
  class="category"
  src="{(indicator.dutchCategory || indicator.category) + $configStore.categoryPath}.png"
  alt={indicator.category}
  on:mouseover={handleCategoryMouseOver}
  on:mouseout={handleCategoryMouseOut}
/>
<div class={"indicator-info indicator-info-" + indicator.title.replaceAll(' ', '').replaceAll(',', '_').replaceAll('/', '_').replaceAll('(', '').replaceAll(')', '').replaceAll('|', '_')} style="left:{indicatorInfoPosition}px">
  <p class="title" style="background-color:{$configStore.mainColor}">
    <strong>{indicator.title}</strong>
  </p>
  <hr />
  <p class="description">{indicator.description}</p>
</div>

<style>
  .question-mark {
    position: absolute;
    right: 5px;
    top: 5px;
    z-index: 10;
  }

  .category {
    width: 29px;
    padding: 0px 6px;
    margin: 0;
    position: absolute;
    border-radius: 50px;
    top: 5px;
    left: 5px;
    z-index: 10;
  }

  h3 {
    padding: 3px 11px;
    margin: 0;
    position: absolute;
    border-radius: 50px;
    top: 5px;
    color: white;
    cursor: default;
  }

  .indicator-info {
    visibility: hidden;
    position: absolute;
    width: 300px;
    background-color: white;
    top: 0;
    z-index: 1000;
    box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
    border-radius: 20px;
    padding: 10px 20px;
  }

  .title {
    padding: 3px 10px;
    border-radius: 50px;
    color: white;
    float: left;
    margin: 0;
    margin-bottom: 1rem;
  }

  hr {
    width: 100%;
    margin: 1rem 0;
  }

  .description {
    margin: 0;
  }

  .question-mark:hover ~ .indicator-info {
    visibility: visible;
  }

</style>
