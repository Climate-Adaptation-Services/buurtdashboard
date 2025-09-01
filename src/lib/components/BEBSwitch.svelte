<script>
  import { getIndicatorStore, configStore } from "$lib/stores"

  export let indicator

  // Get the dedicated store for this specific indicator
  const indicatorStore = getIndicatorStore(indicator.title)

  let selectedBEB = "hele_buurt"

  // Subscribe to this indicator's store changes
  $: {
    selectedBEB = $indicatorStore.beb || "hele_buurt"
  }

  /**
   * Handle BEB selection change
   */
  function bebChange(event) {
    const newBEB = event.target.value
    indicatorStore.update(selection => ({ ...selection, beb: newBEB }))
  }
</script>

<div class="beb-switch">
  <span class="beb-label">Gebied</span>
  <div class="dropdown-wrapper">
    <select class="beb-dropdown" bind:value={selectedBEB} on:change={bebChange} style="border-color: {$configStore.mainColor};">
      <option value="hele_buurt" selected={selectedBEB === "hele_buurt"}>Hele buurt</option>
      <option value="bebouwde_kom" selected={selectedBEB === "bebouwde_kom"}>Bebouwde kom</option>
    </select>
    <span class="dropdown-arrow">&#9662;</span>
  </div>
</div>

<style>
  .beb-switch {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-left: 8px;
  }

  .beb-label {
    font-size: 18px;
    color: #333;
    font-weight: normal;
  }

  .dropdown-wrapper {
    position: relative;
    display: inline-block;
    width: 120px;
  }

  .dropdown-arrow {
    pointer-events: none;
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 14px;
    color: var(--background-color);
    z-index: 2;
  }

  .beb-dropdown {
    width: 120px;
    height: 32px;
    border-radius: 8px;
    font-size: 16px;
    padding: 4px 24px 4px 8px;
    color: #333;
    background: #fff;
    box-shadow: 0 2px 8px rgba(54, 87, 91, 0.08);
    transition:
      border 0.3s,
      background 0.3s,
      color 0.3s;
    appearance: none;
    cursor: pointer;
    outline: none;
    border: 2px solid var(--background-color);
  }

  .beb-dropdown:hover {
    background: #f8f8f8;
  }

  .beb-dropdown:focus {
    box-shadow: 0 0 0 3px rgba(54, 87, 91, 0.1);
  }

  .beb-dropdown option {
    color: #333;
    background: #f8f8f8;
  }
</style>