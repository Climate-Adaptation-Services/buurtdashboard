<script>
  import { AHNSelecties, allMunicipalitiesJSONData, configStore, neighbourhoodsInMunicipalityJSONData } from "$lib/stores"
  import { afterUpdate } from "svelte"
  import { getIndicatorAttribute } from "$lib/noncomponents/getIndicatorAttribute"

  export let indicator
  export let graphWidth

  let indicatorInfoPosition
  afterUpdate(() => {
    indicatorInfoPosition =
      window.innerWidth -
        document.getElementsByClassName("indicator-info-" + getIndicatorAttribute(indicator, indicator.attribute))[0].getBoundingClientRect().right >
      180
        ? graphWidth
        : 0
  })
</script>

<h3 class="question-mark" style="background-color:{$configStore.mainColor}">i</h3>
<!-- <h3 class="category" style="background-color:{$configStore.mainColor}">C</h3> -->
<img class="category" src="{indicator.category + $configStore.categoryPath}.png" alt={indicator.category} />
<div class="category-tooltip">Categorie: {indicator.category}</div>
<div class={"indicator-info indicator-info-" + getIndicatorAttribute(indicator, indicator.attribute)} style="left:{indicatorInfoPosition}px">
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

  .category-tooltip {
    visibility: hidden;
    position: absolute;
    left: 40px;
    top: 10px;
    background-color: white;
    padding: 2px 8px;
    border-radius: 4px;
    box-shadow: rgba(0, 0, 0, 0.15) 0px 2px 8px;
    font-size: 0.9rem;
    white-space: nowrap;
    z-index: 1000;
  }

  .category:hover ~ .category-tooltip {
    visibility: visible;
  }
</style>
