<script>
  import { getIndicatorStore, configStore } from "$lib/stores"

  export let indicator

  // Get the dedicated store for this specific indicator
  const indicatorStore = getIndicatorStore(indicator.title)

  /**
   * Handle BEB selection change from user interaction
   */
  function handleChange(event) {
    indicatorStore.update(selection => ({ ...selection, beb: event.target.value }))
  }
</script>

<div class="beb-switch">
  <div class="dropdown-wrapper">
    <select class="beb-dropdown" value={$indicatorStore.beb || "hele_buurt"} on:change={handleChange} style="border-color: {$configStore.mainColor};">
      <option value="hele_buurt">Hele buurt</option>
      <option value="bebouwde_kom">Bebouwde kom</option>
    </select>
    <span class="dropdown-arrow">&#9662;</span>
  </div>
</div>

<style>
  .beb-switch {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    margin-left: 8px;
    background-color: #e8e8e8;
    padding: 8px 12px;
    border-radius: 8px;
  }

  .beb-label {
    font-size: 18px;
    color: #333;
    font-weight: normal;
    text-align: center;
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