<script>
    import Carousel from 'svelte-carousel'
    import { browser } from '$app/environment';

    let carousel;

    export let type = 'intro'

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
    <div style='padding:15px'>
      <h1>Buurtdashboard Klimaateffectatlas</h1>
      <p>
        Wil je voor één of meer buurten inzicht krijgen in hoe klimaatbestendig ze zijn? Daar kan dit buurtdashboard je bij helpen.  
      </p>
      <h3>Wat kun je met het Buurtdashboard?</h3>
      <p>
        Met het buurtdashboard krijg je snel inzicht in hoe klimaatbestendig buurten zijn. Je kunt er bijvoorbeeld vinden hoe groen een buurt is of hoe hoog de gevoelstemperatuur is op een warme zomerdag. De statistieken kun je vergelijken met buurten van hetzelfde wijktype of met de rest van de gemeente. Ook kan het buurtdashboard helpen om te bepalen welke opgaven het meest urgent zijn of waar de meeste kansen liggen voor klimaatadaptatie.
      </p>
      <h3>Voor wie is het buurtdashboard een handige tool?</h3>
      <p>
        Het buurtdashboard is vooral handig voor gemeenten. Maar ook andere partijen die met klimaatadaptatie aan de slag willen, kunnen er gebruik van maken.
      </p>
      <h3>Is het dashboard alleen geschikt voor stedelijk gebied?</h3>
      <p>
        Het buurtdashboard biedt vooral inzicht in stedelijke buurten, al staan er ook landelijke buurten in.
      </p>
      <h3>Hoe is het buurtdashboard tot stand gekomen? </h3>
      <p>
        Veel informatie in het buurtdasboard komt direct uit de Klimaateffectatlas, maar sommige gegevens komen van andere bronnen, zoals van het CBS en RIVM. Het buurtdashboard is ontwikkeld in samenwerking met de Hogeschool van Amsterdam en Deltares. 
      </p>
    </div>
  {:else}
    <p>Deze functie is binnenkort beschikbaar</p>
  {/if}
</div>

<style>
  div{
    color:#2c2b2b;
  }

  h1, h3{
    color:#36575B
  }

  h3{
    margin-bottom:0px;
  }

  p{
    margin-top:8px;
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

