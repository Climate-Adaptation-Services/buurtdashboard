<script>
  import { configStore } from "$lib/stores"
  import { t } from "$lib/i18n/translate.js"
  import YearSwitch from "./YearSwitch.svelte"

  export let indicator
  export let titleHeight = 120
</script>

<div class="indicator-title" style="height: {titleHeight}px">
  <!-- <h4 class="category">{t("Categorie")}: {indicator.category}</h4> -->
  <h2 class="title" class:long-title={indicator.title.length > 35} style="background-color:{$configStore.mainColor}">
    {indicator.title}
  </h2>
  {#if indicator.AHNversie && indicator.AHNversie.length > 0}
    <div class="year-switch-container">
      <YearSwitch {indicator} />
    </div>
  {/if}
</div>

<style>
  .indicator-title {
    display: flex;
    flex-direction: column;
    background-color: whitesmoke;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    position: relative;
    z-index: 2;
  }

  .category {
    margin: 0;
    color: #bb9012;
  }

  .title {
    padding: 5px 15px;
    margin: 0px 40px 0px 40px;
    border-radius: 15px;
    color: white;
    text-align: center;
    font-size: 1.3rem;
  }

  .title.long-title {
    font-size: 1.0rem;
  }

  .year-switch-container {
    margin-top: 0px;
  }
</style>
