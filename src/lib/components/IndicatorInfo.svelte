<script>
  import { AHNSelecties, allMunicipalitiesJSONData, configStore, neighbourhoodsInMunicipalityJSONData, tooltipRegion } from "$lib/stores"
  import { afterUpdate } from "svelte"
  import { getIndicatorAttribute } from "$lib/utils/getIndicatorAttribute"
  import { t } from "$lib/i18n/translate.js"

  export let indicator
  export let graphWidth

  let indicatorInfoPosition
  afterUpdate(() => {
    indicatorInfoPosition =
      window.innerWidth -
        document.getElementsByClassName("indicator-info-" + indicator.title.replaceAll(' ', '').replaceAll(',', '_').replaceAll('/', '_').replaceAll('(', '').replaceAll(')', ''))[0].getBoundingClientRect().right >
      180
        ? graphWidth
        : 0
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
  src="{indicator.category + $configStore.categoryPath}.png"
  alt={indicator.category}
  on:mouseover={handleCategoryMouseOver}
  on:mouseout={handleCategoryMouseOut}
/>
<div class={"indicator-info indicator-info-" + indicator.title.replaceAll(' ', '').replaceAll(',', '_').replaceAll('/', '_').replaceAll('(', '').replaceAll(')', '')} style="left:{indicatorInfoPosition}px">
  <p class="title" style="background-color:{$configStore.mainColor}">
    <strong>{indicator.title}</strong>
  </p>
  <hr />
  <p class="description">{indicator.description}</p>
</div>

<style>
  .question-mark {
    right: 5px;
  }

  .category {
    width: 29px;
    padding: 0px 6px;
    margin: 0;
    position: absolute;
    border-radius: 50px;
    top: 5px;
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
