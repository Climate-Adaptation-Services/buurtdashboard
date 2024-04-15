<script>
    import Carousel from 'svelte-carousel'
    import { browser } from '$app/environment';

    let carousel;

</script>

<div>
  {#if browser}
    <Carousel bind:this={carousel} >
      <img src='./carousel-1.png' alt='carousel1' />
      <img src='./carousel-2.png' alt='carousel2' />
    </Carousel>
  {/if}
</div>

<style>
  div{
    color:#2c2b2b;
  }

</style>

