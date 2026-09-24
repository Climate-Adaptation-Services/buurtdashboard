<script>
  import { bind } from "svelte-simple-modal"
  import { mapModal, configStore } from "$lib/stores"
  import { t } from "$lib/i18n/translate.js"
  import MapModal from "./MapModal.svelte"

  export let indicator
  export let indicatorValueColorscale
  // Maten van de tegel, zodat de linkerkolom in de modal even groot blijft
  export let bodyHeight
  export let graphHeight

  let buttonElement
  let screenWidth = 1000 // zelfde startwaarde als +page.svelte

  // De modal toont grafiek en kaart naast elkaar; onder dit breekpunt is daar geen
  // ruimte voor. 800px is het breekpunt dat de rest van de app ook aanhoudt.
  const MODAL_MIN_WIDTH = 800
  $: modalAvailable = screenWidth >= MODAL_MIN_WIDTH

  // Sluit een open modal als het venster alsnog onder het breekpunt zakt
  $: if (!modalAvailable && $mapModal) {
    mapModal.set(null)
  }

  function openMapModal() {
    // De graphWidth-prop is in de tegel nooit gevuld (de bind:clientWidth zit pas
    // in de grafiekcomponent en loopt niet terug omhoog), dus meten we de tegel op.
    const card = buttonElement?.closest(".indicator-div")
    const cardWidth = card ? Math.round(card.getBoundingClientRect().width) : 400

    mapModal.set(
      bind(MapModal, {
        indicator,
        indicatorValueColorscale,
        graphWidth: cardWidth,
        bodyHeight,
        graphHeight,
      }),
    )
  }

  // Geaggregeerde kaarten tekenen zelf al een info-icoon rechtsboven (28px op y=6),
  // dus daar zakt de knop eronder in plaats van ernaast
  $: topOffset = indicator.aggregatedIndicator === true ? 38 : 6
</script>

<svelte:window bind:innerWidth={screenWidth} />

{#if modalAvailable}
  <button
    bind:this={buttonElement}
    type="button"
    class="expand-map"
    style="background-color:{$configStore.mainColor}; top:{topOffset}px"
    on:click={openMapModal}
    aria-label="{t('Kaart_vergroten')}: {indicator.title}"
  >
    <!-- Vier hoeken naar buiten: het gangbare "vergroten"-symbool -->
    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" focusable="false">
      <path
        d="M9 3H3v6M15 3h6v6M9 21H3v-6M15 21h6v-6"
        fill="none"
        stroke="currentColor"
        stroke-width="2.4"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </button>
{/if}

<style>
  .expand-map {
    /* Rechtsboven in de kaartcontainer (.indicator-map is position: relative).
       top wordt inline gezet: bij geaggregeerde kaarten staat het info-icoon erboven. */
    position: absolute;
    right: 6px;
    z-index: 10;
    width: 28px;
    height: 28px;
    padding: 0;
    border: none;
    border-radius: 50%;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: transform 160ms cubic-bezier(0.23, 1, 0.32, 1);
  }

  .expand-map:active {
    transform: scale(0.94);
  }

  .expand-map:focus-visible {
    outline: 2px solid #1a1a1a;
    outline-offset: 2px;
  }

  @media (hover: hover) and (pointer: fine) {
    .expand-map:hover {
      transform: scale(1.08);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .expand-map,
    .expand-map:hover,
    .expand-map:active {
      transition: none;
      transform: none;
    }
  }
</style>
