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
    <div style='padding:15px'>
      <h1>Buurtdashboard Klimaateffectatlas</h1>
      <p>
        Het Buurtdashboard biedt per buurt inzicht in verschillende opgaven op het gebied van klimaatadaptatie. Gemeenten kunnen het dashboard bijvoorbeeld gebruiken om te bepalen welke opgaven in een buurt het meest urgent zijn of waar veel kansen liggen voor klimaatadaptatie.
      </p>
      <h3>Wat kun je met het Buurtdashboard?</h3>
      <p>
        Je kunt het Buurtdashboard gebruiken om voor een buurt verschillende indicatoren te bekijken en deze te vergelijken met andere buurten. Je kunt bijvoorbeeld zien hoe groen een buurt is of welke gevoelstemperaturen er op een hete zomerdag veel voorkomen. Of je kunt voor een bepaalde buurt bekijken wat de grootste opgaven zijn op het gebied van klimaatadaptatie. Het buurtdashboard laat voor elke indicator zien wat de statistieken zijn op buurtniveau en gemeenteniveau. Je kunt bijvoorbeeld kijken of het percentage groen in een buurt sterk afwijkt van de andere buurten in die gemeente. Ook kun je bekijken of de statistieken ongeveer gelijk zijn aan andere buurten van hetzelfde wijktype.
      </p>
      <h3>Wie heeft het Buurtdashboard ontwikkeld?</h3>
      <p>
        Het Buurtdashboard is ontwikkeld in samenwerking met de Hogeschool van Amsterdam en Deltares. De meeste statistieken zijn gebaseerd op informatie uit de Klimaateffectatlas. Een aantal statistieken komen van andere bronnen, zoals van het CBS en het RIVM.
      </p>
    </div>
  {/if}
</div>

<style>
  div{
    color:#2c2b2b;
  }

  h1, h3{
    color:#36575B
  }

</style>

