<script>
  import { indicatorYearChanged, jaarSelecties, backgroundColor } from "$lib/stores"

  export let indicator

  let selectedYear = "2023"

  function yearClick(year) {
    selectedYear = year

    indicatorYearChanged.set([indicator.title, year])

    $jaarSelecties[indicator.title] = year
    jaarSelecties.set($jaarSelecties)
  }
</script>

<!-- Replacing SVG year switch with two dropdowns -->
<div class="year-switch-dropdowns">
  <select class="year-dropdown" bind:value={selectedYear} on:change={() => yearClick(selectedYear)}>
    <option value="2019">2019</option>
    <option value="2023">2023</option>
    <option value="Difference">Verschil</option>
  </select>
  <select class="year-dropdown" bind:value={selectedYear} on:change={() => yearClick(selectedYear)}>
    <option value="2019">2019</option>
    <option value="2023">2023</option>
    <option value="Difference">Verschil</option>
  </select>
</div>

<style>
  .year-switch-dropdowns {
    display: flex;
    gap: 20px;
    margin-top: 12px;
    align-items: center;
  }
  .year-dropdown {
    width: 110px;
    height: 36px;
    border: 2px solid lightgrey;
    border-radius: 12px;
    background: var(--year-dropdown-bg, lightgrey);
    color: var(--year-dropdown-color, #333);
    font-size: 18px;
    padding: 3px 10px;
    transition: border 0.3s, background 0.3s;
    box-shadow: 0 0 8px rgba(160,160,160,0.08);
  }
  .year-dropdown:focus {
    outline: none;
    border-color: #b0b0b0;
    background: #ededed;
  }
  .year-dropdown option {
    background: var(--year-dropdown-bg, lightgrey);
    color: var(--year-dropdown-color, #333);
  }
  .year-dropdown option:hover {
    background: #ededed;
  }
  .year-dropdown option[selected] {
    background: var(--year-dropdown-bg, lightgrey);
    color: white;
  }
</style>
