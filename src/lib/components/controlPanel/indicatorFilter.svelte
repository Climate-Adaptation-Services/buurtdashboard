<script>
  import { indicatorsSelection, URLParams } from "$lib/stores"
  import { addURLParameter, removeURLParameter } from "$lib/services/urlManager"
  import { browser } from "$app/environment"
  import { t } from "$lib/i18n/translate.js"

  export let allIndicators

  const categories = ['Effecten', 'Gebiedskenmerken', 'Kwetsbaarheid']

  let searchText = ''
  let isOpen = false
  let dropdownRef

  // Group indicators by category
  const indicatorsByCategory = categories.map(category => ({
    category,
    indicators: allIndicators.filter(ind => ind.category === category)
  }))

  // Filter indicators based on search and exclude already selected ones
  $: filteredCategories = indicatorsByCategory.map(cat => ({
    ...cat,
    indicators: cat.indicators.filter(ind =>
      !$indicatorsSelection.includes(ind.title) &&
      ind.title.toLowerCase().includes(searchText.toLowerCase())
    )
  })).filter(cat => cat.indicators.length > 0)

  // Always show category headers
  $: showCategoryHeaders = true

  function selectIndicator(title) {
    // Add to indicatorsSelection store
    $indicatorsSelection = [...$indicatorsSelection, title]

    // Update URL params
    const newParams = new URLSearchParams($URLParams)
    newParams.append("indicator", title)
    $URLParams = newParams
    addURLParameter()

    // Clear search and keep dropdown open
    searchText = ''
  }

  function removeIndicator(title) {
    // Remove from indicatorsSelection store
    $indicatorsSelection = $indicatorsSelection.filter(i => i !== title)

    // Update URL params
    const newParams = new URLSearchParams($URLParams)
    const currentIndicators = newParams.getAll("indicator")
    newParams.delete("indicator")
    currentIndicators.forEach(indicator => {
      if (indicator !== title) {
        newParams.append("indicator", indicator)
      }
    })
    $URLParams = newParams
    removeURLParameter()
  }

  function clearAll() {
    // Clear indicatorsSelection store
    $indicatorsSelection = []

    // Update URL params
    const newParams = new URLSearchParams($URLParams)
    newParams.delete("indicator")
    $URLParams = newParams
    removeURLParameter()
  }

  // Close dropdown when clicking outside
  function handleClickOutside(event) {
    if (dropdownRef && !dropdownRef.contains(event.target)) {
      isOpen = false
    }
  }
</script>

<svelte:window on:click={handleClickOutside} />

{#if browser}
  <div class="custom-multiselect" bind:this={dropdownRef}>
    <p style="margin-bottom:5px">{`Filter ${t("indicatoren")}:`}</p>

    <!-- Input area with selected tags -->
    <div class="input-container" on:click={() => isOpen = true}>
      {#each $indicatorsSelection as selected}
        <span class="tag">
          {selected}
          <button on:click|stopPropagation={() => removeIndicator(selected)}>×</button>
        </span>
      {/each}
      <input
        type="text"
        placeholder={$indicatorsSelection.length === 0 ? "Zoek indicatoren..." : ""}
        bind:value={searchText}
        on:focus={() => isOpen = true}
        on:click|stopPropagation
      />
      {#if $indicatorsSelection.length > 0}
        <button class="clear-all-btn" on:click|stopPropagation={clearAll}>×</button>
      {/if}
    </div>

    <!-- Dropdown menu -->
    {#if isOpen}
      <div class="dropdown-menu">
        {#each filteredCategories as { category, indicators }}
          {#if showCategoryHeaders}
            <div class="category-header">{category}</div>
          {/if}
          {#each indicators as indicator}
            <div class="indicator-item" on:click={() => selectIndicator(indicator.title)}>
              {indicator.title}
            </div>
          {/each}
        {/each}
        {#if filteredCategories.length === 0}
          <div class="no-results">No indicators found</div>
        {/if}
      </div>
    {/if}
  </div>
{/if}

<style>
  .custom-multiselect {
    width: 330px;
    color: white;
    font-size: 12px;
    position: relative;
  }

  .input-container {
    background: #36575a;
    border: 2px solid white;
    border-radius: 4px;
    padding: 4px;
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    align-items: flex-start;
    min-height: 34px;
    cursor: text;
    position: relative;
  }

  .tag {
    background: #36575a;
    color: white;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 11px;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    white-space: nowrap;
    border: 1px solid white;
  }

  .tag button {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    font-size: 14px;
    padding: 0;
    line-height: 1;
    font-weight: bold;
  }

  .tag button:hover {
    opacity: 0.8;
  }

  .input-container input {
    flex: 1;
    min-width: 100px;
    border: none;
    outline: none;
    font-size: 12px;
    padding: 4px;
    color: white;
    background: transparent;
  }

  .input-container input::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }

  .clear-all-btn {
    background: none;
    color: white;
    border: none;
    cursor: pointer;
    font-size: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    line-height: 1;
    position: absolute;
    top: 1px;
    right: 4px;
    font-weight: bold;
  }

  .clear-all-btn:hover {
    opacity: 0.7;
  }

  .dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    max-height: 300px;
    overflow-y: auto;
    background: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    z-index: 1000;
    margin-top: 2px;
  }

  .category-header {
    color: steelblue;
    background-color: #e5e3e3;
    text-align: center;
    padding: 8px;
    font-weight: normal;
    cursor: default;
  }

  .indicator-item {
    padding: 8px 12px;
    cursor: pointer;
    color: black;
    background-color: white;
  }

  .indicator-item:hover {
    background-color: #f0f0f0;
  }

  .no-results {
    padding: 12px;
    text-align: center;
    color: #999;
  }
</style>
