<script>
  import { getIndicatorStore, configStore } from "$lib/stores"
  import { t } from "$lib/i18n/translate.js"

  export let indicator

  // Get the dedicated store for this specific indicator
  // Use dutchTitle for store key to ensure consistency across languages
  const indicatorStore = getIndicatorStore(indicator.dutchTitle || indicator.title)

  // Check if this indicator has BEB variants
  $: hasBEBVariant = indicator.variants &&
    indicator.variants.split(',').map(v => v.trim()).some(v => v !== 'M2' && v !== '')

  /**
   * Toggle between hele_buurt and bebouwde_kom for this indicator
   */
  function toggleBEB() {
    indicatorStore.update(state => ({
      ...state,
      beb: state.beb === 'bebouwde_kom' ? 'hele_buurt' : 'bebouwde_kom'
    }))
  }

  $: isActive = $indicatorStore.beb === 'bebouwde_kom'
</script>

{#if hasBEBVariant}
  <div class="beb-wrapper">
    <button
      class="beb-pill"
      class:active={isActive}
      on:click={toggleBEB}
      style="--main-color: {$configStore.mainColor}; border-color: {$configStore.mainColor}"
    >
      <svg class="beb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6"/>
      </svg>
      <span class="beb-label">Bebouwde</span>
      <span class="beb-label">kom</span>
    </button>
    <div class="beb-tooltip">
      <p class="tooltip-text">
        {isActive ? t("Toont alleen data binnen de bebouwde kom. Klik om hele buurt te tonen.") : t("Klik om alleen data binnen de bebouwde kom te tonen.")}
      </p>
    </div>
  </div>
{/if}

<style>
  .beb-wrapper {
    position: relative;
    margin-top: 8px;
    margin-left: 8px;
    margin-right: -4px;
  }

  .beb-pill {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0px;
    padding: 4px 6px;
    background-color: #fff;
    border: 1.5px solid var(--main-color);
    border-radius: 10px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
    color: #666;
    transition: all 0.2s ease;
    height: auto;
    min-width: 50px;
    box-shadow: 0 1px 4px rgba(54, 87, 91, 0.08);
  }

  .beb-pill:hover {
    background-color: #f5f5f5;
  }

  .beb-pill.active {
    background-color: var(--main-color);
    color: white;
  }

  .beb-pill.active:hover {
    opacity: 0.9;
    background-color: var(--main-color);
  }

  .beb-icon {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }

  .beb-label {
    font-size: 10px;
    letter-spacing: 0.2px;
    line-height: 1.1;
  }

  .beb-tooltip {
    visibility: hidden;
    opacity: 0;
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 8px;
    width: 220px;
    background-color: white;
    z-index: 1000;
    box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
    border-radius: 12px;
    padding: 10px 14px;
    transition: opacity 0.2s ease, visibility 0.2s ease;
  }

  .beb-wrapper:hover .beb-tooltip {
    visibility: visible;
    opacity: 1;
  }

  .tooltip-text {
    margin: 0;
    font-size: 12px;
    color: #555;
    line-height: 1.4;
  }
</style>