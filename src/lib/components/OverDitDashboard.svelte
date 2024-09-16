<script>
    import Carousel from 'svelte-carousel'
    import { browser } from '$app/environment';
    import { t } from '$lib/i18n/translate';
    import { onMount } from 'svelte';
    import { selectAll } from 'd3';

    let carousel;

    export let type = 'intro'

    onMount(() => {
      // selectAll('h1,h3').style('color', "#36575B")
      selectAll("h3").style("margin-bottom", "0px")
      selectAll("p").style("margin-top", '8px')
  
    })

</script>

<div>
  {#if browser && type === 'graphs'}
    <Carousel bind:this={carousel}>
      <div class='carousel-div'>
        <h4>Indicator type 1: Enkelvoudige numerieke indicator</h4>
        <img src='./carousel-2.png' alt='carousel2' />
      </div>
      <div class='carousel-div'>
        <h4>Indicator type 2: Meervoudige categorische indicator</h4>
        <img src='./carousel-1.png' alt='carousel1' />
      </div>
    </Carousel>
  {:else if type === 'intro'}
    <div style='padding:15px; '>
      {@html t("Over dit dashboard")}
    </div>
  {:else}
    <p>Deze functie is binnenkort beschikbaar</p>
  {/if}
</div>

<style>
  div{
    color:#2c2b2b;
  }

  .carousel-div{
    height:500px;
  }
  img{
    height:80%;
  }

  h4{
    text-align: center;
  }

</style>

