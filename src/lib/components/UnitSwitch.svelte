<script>
  import { getIndicatorStore, configStore } from "$lib/stores"

  export let indicator

  // Get the dedicated store for this specific indicator
  const indicatorStore = getIndicatorStore(indicator.title)

  let selectedUnit = "%"

  // Subscribe to this indicator's store changes
  $: {
    selectedUnit = $indicatorStore.unit || "%"
  }

  /**
   * Handle unit selection change - much simpler now!
   */
  function unitChange(event) {
    const newUnit = event.target.value
    indicatorStore.update(selection => ({ ...selection, unit: newUnit }))
  }
</script>

<div class="unit-switch">
  <span class="unit-label">in</span>
  <div class="dropdown-wrapper">
    <select class="unit-dropdown" bind:value={selectedUnit} on:change={unitChange} style="border: 2px solid {$configStore.mainColor};">
      <option value="%" selected={selectedUnit === "%"}>%</option>
      <option value="m2" selected={selectedUnit === "m2"}>m²</option>
    </select>
    <span class="dropdown-arrow">&#9662;</span>
  </div>
</div>

<style>
  .unit-switch {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-left: 8px;
  }

  .unit-label {
    font-size: 18px;
    color: #333;
    font-weight: normal;
  }

  .dropdown-wrapper {
    position: relative;
    display: inline-block;
    width: 80px;
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

  .unit-dropdown {
    width: 80px;
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

  .unit-dropdown:hover {
    background: #f8f8f8;
  }

  .unit-dropdown:focus {
    box-shadow: 0 0 0 3px rgba(54, 87, 91, 0.1);
  }

  .unit-dropdown option {
    color: #333;
    background: #f8f8f8;
  }
</style>
