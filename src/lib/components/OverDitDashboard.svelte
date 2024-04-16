<script>
    import Carousel from 'svelte-carousel'
    import { browser } from '$app/environment';

    let carousel;

    export let type = 'intro'

</script>

<div>
  {#if browser && type === 'graphs'}
    <Carousel bind:this={carousel} >
      <img src='./carousel-1.png' alt='carousel1' />
      <img src='./carousel-2.png' alt='carousel2' />
    </Carousel>
  {:else}
    <p style='padding:15px'>
      Met het buurtdashboard kan je klimaatinformatie voor buurten makkelijk vergelijken. Zo kan je snel vinden of een buurt veel of juist weinig groen heeft ten opzichte van vergelijkbare buurten en hoe hoog de gevoelstemperatuur ligt tijdens een zomerse dag. Je vindt in het buurtdashboard vooral informatie uit de Klimaateffectatlas, aangevuld met informatie uit enkele andere bronnen. Het buurtdashboard is ontwikkeld in samenwerking met HvA en Deltares.
    </p>
  {/if}
</div>

<style>
  div{
    color:#2c2b2b;
  }

</style>

