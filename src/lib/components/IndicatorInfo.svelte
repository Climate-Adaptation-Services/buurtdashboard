<script>
  import { backgroundColor } from "$lib/stores"
  import { afterUpdate } from "svelte"

  export let indicator
  export let graphWidth

  let indicatorInfoPosition
  afterUpdate(() => {
    indicatorInfoPosition =
      window.innerWidth - document.getElementsByClassName("indicator-info-" + indicator.attribute)[0].getBoundingClientRect().right > 180
        ? graphWidth
        : 0
  })
</script>

<h3 class="question-mark" style="background-color:{$backgroundColor}">?</h3>

<div class={"indicator-info indicator-info-" + indicator.attribute} style="left:{indicatorInfoPosition}px">
  <p class="title" style="background-color:{$backgroundColor}">
    <strong>{indicator.title}</strong>
  </p>
  <hr />
  <p class="description">{indicator.description}</p>
</div>

<style>
  .question-mark {
    padding: 3px 10px;
    margin: 0;
    position: absolute;
    border-radius: 50px;
    right: 5px;
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
