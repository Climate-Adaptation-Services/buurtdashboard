<script>
  import { onMount, createEventDispatcher, tick } from 'svelte'
  import { browser } from '$app/environment'
  import { goto } from '$app/navigation'
  import { page } from '$app/stores'
  import { getIndicatorStore, municipalitySelection, neighbourhoodSelection, indicatorsSelection, URLParams, neighbourhoodsInMunicipalityJSONData, neighbourhoodCodeAbbreviation } from '$lib/stores'
  import { get } from 'svelte/store'

  const dispatch = createEventDispatcher()

  export let isOpen = false

  let currentStep = 0
  let highlightRect = null // Position of the highlighted element
  let originalMunicipality = null // Store original municipality to restore after tutorial
  let originalNeighbourhood = null // Store original neighbourhood to restore after tutorial
  let originalIndicators = null // Store original indicator selection
  let originalBoomkroonAHN = null // Store original AHN selection
  let municipalitySetupDone = false // Track if we've selected Utrecht
  let neighbourhoodSetupDone = false // Track if we've selected a buurt
  let viewportWidth = 1920 // Default, will be updated
  let viewportHeight = 1080 // Default, will be updated

  // Tutorial steps - visual guide only (no actions)
  const tutorialSteps = [
    {
      id: 'welcome',
      title: 'Welkom bij het Buurtdashboard',
      description: 'Deze tutorial legt uit hoe je het dashboard kunt gebruiken. Je kunt de tutorial altijd opnieuw starten via het kompas-icoon linksboven.',
      target: null,
      position: 'center'
    },
    {
      id: 'map',
      title: 'Interactieve kaart',
      description: 'Klik op een gemeente om in te zoomen. Daarna kun je een buurt selecteren om gedetailleerde informatie te zien.',
      target: '.map',
      position: 'right'
    },
    {
      id: 'demo-select',
      title: 'Voorbeeld: Utrecht',
      description: 'We selecteren nu Utrecht als voorbeeld om de indicatoren te bekijken.',
      target: '.map',
      position: 'right'
    },
    {
      id: 'control-panel',
      title: 'Zoeken en filteren',
      description: 'Zoek naar een gemeente of buurt, of filter indicatoren op categorie.',
      target: '.control-panel',
      position: 'right'
    },
    {
      id: 'demo-buurt',
      title: 'Voorbeeld: buurt selecteren',
      description: 'We selecteren nu een buurt om de buurtspecifieke data te bekijken.',
      target: '.control-panel .svelte-select',
      targetIndex: 1, // Second svelte-select (buurt, not gemeente)
      position: 'right'
    },
    {
      id: 'demo-indicators',
      title: 'Voorbeeld: indicatoren selecteren',
      description: 'We selecteren nu Boomkroonoppervlakte en Gevoelstemperatuur als voorbeeld indicatoren.',
      target: '.control-panel .input-container',
      position: 'right'
    },
    {
      id: 'numerical-indicator',
      title: 'Numerieke indicator: Boomkroonoppervlakte',
      description: 'Dit is een numerieke indicator. De waarde is een getal dat je kunt vergelijken met andere buurten, gemeentes, heel Nederland en andere buurten met hetzelfde wijktype.',
      target: '[data-indicator-title="Boomkroonoppervlakte"]',
      position: 'left'
    },
    {
      id: 'info-icon',
      title: 'Info icoon',
      description: 'Klik op het "i" icoon rechtsboven in een indicator voor een korte beschrijving van de indicator.',
      target: '[data-indicator-title="Boomkroonoppervlakte"] .question-mark',
      position: 'left'
    },
    {
      id: 'more-info-link',
      title: 'Meer informatie',
      description: 'Klik op "Meer info" rechtsonder om naar de bronpagina van de indicator te gaan voor uitgebreide informatie.',
      target: '[data-indicator-title="Boomkroonoppervlakte"] .info-link',
      position: 'left'
    },
    {
      id: 'indicator-stats',
      title: 'Statistieken vergelijken',
      description: 'Vergelijk waarden voor Nederland, gemeente, buurt en wijktype. De gekleurde balk toont waar de waarde valt binnen de schaal.',
      target: '[data-indicator-title="Boomkroonoppervlakte"] .indicator-overview',
      position: 'left'
    },
    {
      id: 'median-explanation',
      title: 'Mediaan',
      description: 'De getoonde waarden zijn medianen: de middelste waarde van alle buurten. Elke buurt telt even zwaar mee, ongeacht grootte of inwoneraantal.',
      target: '[data-indicator-title="Boomkroonoppervlakte"] .indicator-overview',
      position: 'left'
    },
    {
      id: 'beeswarm-plot',
      title: 'Verdeling van buurten',
      description: 'Elke stip is een buurt. De stippen zijn gegroepeerd langs de schaal zodat je snel kunt zien hoe de geselecteerde buurt zich verhoudt tot andere buurten.',
      target: '[data-indicator-title="Boomkroonoppervlakte"] .indicator-graph',
      position: 'left'
    },
    {
      id: 'categorical-indicator',
      title: 'Samengestelde indicator: Gevoelstemperatuur',
      description: 'Deze indicator toont meerdere waarden tegelijk. De balkjes geven de verdeling van de gevoelstemperatuur in de buurt: hoeveel procent van het oppervlak valt in elke temperatuurklasse.',
      target: '[data-indicator-title="Gevoelstemperatuur"]',
      position: 'left'
    },
    {
      id: 'bar-chart',
      title: 'Staafdiagram',
      description: 'Het staafdiagram toont de verdeling over de klassen. Hoe langer de balk, hoe groter het aandeel. De kleuren corresponderen met de legenda.',
      target: '[data-indicator-title="Gevoelstemperatuur"] .indicator-graph',
      position: 'left'
    },
    {
      id: 'year-switch',
      title: 'Jaar selectie',
      description: 'Sommige indicatoren hebben data voor meerdere jaren. Gebruik de dropdown om een ander jaar te selecteren of om jaren met elkaar te vergelijken.',
      target: '[data-indicator-title="Boomkroonoppervlakte"] .year-switch-dropdowns',
      position: 'left'
    },
    {
      id: 'indicator-map',
      title: 'Indicatorkaart',
      description: 'Een kaartje dat de geselecteerde indicator visualiseert voor alle buurten in de gemeente.',
      target: '[data-indicator-title="Boomkroonoppervlakte"] .indicator-map',
      position: 'left'
    },
    {
      id: 'done',
      title: 'Klaar!',
      description: 'Je kent nu de basis van het dashboard. Klik op het kompas-icoon linksboven om deze tutorial opnieuw te bekijken.',
      target: null,
      position: 'center'
    }
  ]

  $: currentStepData = tutorialSteps[currentStep]
  $: totalSteps = tutorialSteps.length
  $: isFirstStep = currentStep === 0
  $: isLastStep = currentStep === totalSteps - 1

  // Update highlight when step changes
  $: if (browser && isOpen) {
    updateHighlight(currentStepData)
  }

  async function updateHighlight(stepData) {
    await tick()

    if (!stepData.target) {
      highlightRect = null
      return
    }

    // Support targetIndex for selecting nth element when multiple match
    let targetEl
    if (stepData.targetIndex !== undefined) {
      const elements = document.querySelectorAll(stepData.target)
      targetEl = elements[stepData.targetIndex]
    } else {
      targetEl = document.querySelector(stepData.target)
    }
    if (!targetEl) {
      highlightRect = null
      return
    }

    // Scroll element into view if needed
    targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' })

    // Wait for scroll to finish
    await new Promise(resolve => setTimeout(resolve, 300))

    const rect = targetEl.getBoundingClientRect()
    const padding = 8

    highlightRect = {
      top: rect.top - padding,
      left: rect.left - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2
    }
  }

  function nextStep() {
    if (currentStep < totalSteps - 1) {
      currentStep++
    } else {
      closeTutorial()
    }
  }

  function prevStep() {
    if (currentStep > 0) {
      currentStep--
    }
  }

  async function closeTutorial() {
    isOpen = false
    currentStep = 0
    highlightRect = null
    municipalitySetupDone = false
    neighbourhoodSetupDone = false

    // Restore original context
    await restoreTutorialContext()

    dispatch('close')

    if (browser) {
      localStorage.setItem('buurtdashboard-tutorial-seen', 'true')
    }
  }

  function handleKeydown(event) {
    if (!isOpen) return

    if (event.key === 'Escape') {
      closeTutorial()
    } else if (event.key === 'ArrowRight' || event.key === 'Enter') {
      nextStep()
    } else if (event.key === 'ArrowLeft') {
      prevStep()
    }
  }

  // Get position for the tooltip based on the target element
  function getTooltipStyle(stepData, rect) {
    if (!browser || stepData.position === 'center' || !rect) {
      return 'top: 50%; left: 50%; transform: translate(-50%, -50%);'
    }

    const tooltipWidth = 360
    const tooltipHeight = 220
    const padding = 20
    const minMargin = 20 // Minimum margin from viewport edges
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    // Calculate vertical center of target element
    let verticalCenter = rect.top + rect.height / 2

    // Clamp vertical position to keep tooltip within viewport
    // Tooltip is centered vertically with translateY(-50%), so we need half height margin
    const minTop = minMargin + tooltipHeight / 2
    const maxTop = viewportHeight - minMargin - tooltipHeight / 2
    verticalCenter = Math.max(minTop, Math.min(maxTop, verticalCenter))

    let style = ''

    switch (stepData.position) {
      case 'right':
        // Position to the right of the element
        let leftPos = rect.left + rect.width + padding
        // Check if tooltip would overflow right edge
        if (leftPos + tooltipWidth > viewportWidth - minMargin) {
          // Position to the left instead
          style = `top: ${verticalCenter}px; right: ${viewportWidth - rect.left + padding}px; transform: translateY(-50%);`
        } else {
          style = `top: ${verticalCenter}px; left: ${leftPos}px; transform: translateY(-50%);`
        }
        break
      case 'left':
        // Position to the left of the element
        let rightPos = viewportWidth - rect.left + padding
        // Check if tooltip would overflow left edge
        if (rect.left - tooltipWidth - padding < minMargin) {
          // Position to the right instead
          style = `top: ${verticalCenter}px; left: ${rect.left + rect.width + padding}px; transform: translateY(-50%);`
        } else {
          style = `top: ${verticalCenter}px; right: ${rightPos}px; transform: translateY(-50%);`
        }
        break
      case 'top':
        style = `bottom: ${viewportHeight - rect.top + padding}px; left: ${rect.left + rect.width / 2}px; transform: translateX(-50%);`
        break
      case 'bottom':
        style = `top: ${rect.top + rect.height + padding}px; left: ${rect.left + rect.width / 2}px; transform: translateX(-50%);`
        break
      default:
        style = 'top: 50%; left: 50%; transform: translate(-50%, -50%);'
    }

    return style
  }

  $: tooltipStyle = browser && isOpen ? getTooltipStyle(currentStepData, highlightRect) : ''

  // Save original state when tutorial opens and reset to clean state
  function saveOriginalState() {
    if (!browser) return

    // Save original municipality and neighbourhood selection
    originalMunicipality = get(municipalitySelection)
    originalNeighbourhood = get(neighbourhoodSelection)
    originalIndicators = [...get(indicatorsSelection)]

    // Save original Boomkroonoppervlakte AHN selection
    const boomkroonStore = getIndicatorStore('Boomkroonoppervlakte')
    boomkroonStore.subscribe(v => {
      if (originalBoomkroonAHN === null) {
        originalBoomkroonAHN = { ...v }
      }
    })()

    // Reset to clean state for tutorial
    municipalitySelection.set(null)
    neighbourhoodSelection.set(null)
    indicatorsSelection.set([])
    URLParams.set(new URLSearchParams())
    window.history.replaceState(null, '', '/')
  }

  // Step 1: Select Utrecht municipality
  async function selectMunicipality() {
    if (!browser || municipalitySetupDone) return
    municipalitySetupDone = true

    // Select Utrecht (GM0344)
    municipalitySelection.set('GM0344')
    neighbourhoodSelection.set(null)

    // Update URL to match
    URLParams.update(params => {
      params.set('gemeente', 'GM0344')
      params.delete('buurt')
      return params
    })
    window.history.replaceState(null, '', '?' + get(URLParams).toString())

    // Wait for map to zoom and data to load
    await new Promise(resolve => setTimeout(resolve, 1500))
  }

  // Step 2: Select indicators (Boomkroonoppervlakte and Gevoelstemperatuur)
  async function selectIndicators() {
    if (!browser) return

    // Select the two demo indicators
    indicatorsSelection.set(['Boomkroonoppervlakte', 'Gevoelstemperatuur'])

    // Set Boomkroonoppervlakte to AHN4
    const store = getIndicatorStore('Boomkroonoppervlakte')
    store.update(v => ({ ...v, baseYear: 'AHN4' }))

    // Wait for indicators to render
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  // Step 3: Select a neighbourhood in Utrecht (first available one)
  async function selectNeighbourhood() {
    if (!browser || neighbourhoodSetupDone) return
    neighbourhoodSetupDone = true

    // Get the first neighbourhood from the current municipality
    const neighbourhoods = get(neighbourhoodsInMunicipalityJSONData)
    const codeAbbrev = get(neighbourhoodCodeAbbreviation)

    if (!neighbourhoods?.features?.length) {
      console.warn('No neighbourhoods available for selection')
      return
    }

    // Get the first neighbourhood's code
    const firstNeighbourhood = neighbourhoods.features[0]
    const buurtCode = firstNeighbourhood?.properties?.[codeAbbrev]

    if (!buurtCode) {
      console.warn('Could not get neighbourhood code')
      return
    }

    // Select the neighbourhood
    neighbourhoodSelection.set(buurtCode)

    // Update URL to match
    URLParams.update(params => {
      params.set('buurt', buurtCode)
      return params
    })
    window.history.replaceState(null, '', '?' + get(URLParams).toString())

    // Wait for data to load
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  // Restore original state when tutorial closes
  async function restoreTutorialContext() {
    if (!browser) return

    // Restore original Boomkroonoppervlakte AHN selection
    if (originalBoomkroonAHN) {
      const store = getIndicatorStore('Boomkroonoppervlakte')
      store.set(originalBoomkroonAHN)
      originalBoomkroonAHN = null
    }

    // Restore original indicators
    if (originalIndicators) {
      indicatorsSelection.set(originalIndicators)
      originalIndicators = null
    }

    // Restore original municipality and neighbourhood selection
    if (originalMunicipality) {
      municipalitySelection.set(originalMunicipality)
      URLParams.update(params => {
        params.set('gemeente', originalMunicipality)
        return params
      })
    } else {
      municipalitySelection.set(null)
      URLParams.update(params => {
        params.delete('gemeente')
        return params
      })
    }

    if (originalNeighbourhood) {
      neighbourhoodSelection.set(originalNeighbourhood)
      URLParams.update(params => {
        params.set('buurt', originalNeighbourhood)
        return params
      })
    } else {
      neighbourhoodSelection.set(null)
      URLParams.update(params => {
        params.delete('buurt')
        return params
      })
    }

    // Update browser URL
    const urlString = get(URLParams).toString()
    window.history.replaceState(null, '', urlString ? '?' + urlString : '/')

    originalMunicipality = null
    originalNeighbourhood = null
  }

  // Watch for isOpen changes to save original state and manage body overflow
  $: if (browser && isOpen) {
    saveOriginalState()
    // Prevent body scroll while tutorial is open
    document.body.style.overflow = 'hidden'
  }

  // Restore body overflow when tutorial closes
  $: if (browser && !isOpen) {
    document.body.style.overflow = ''
  }

  // Watch for step changes and trigger appropriate actions
  // Step indices: 0=welcome, 1=map, 2=demo-select (Utrecht), 3=control-panel,
  //               4=demo-buurt, 5=demo-indicators, 6+=indicator details
  $: if (browser && isOpen && currentStep === 2 && !municipalitySetupDone) {
    // Select Utrecht municipality
    selectMunicipality().then(() => {
      updateHighlight(currentStepData)
    })
  }

  $: if (browser && isOpen && currentStep === 4 && !neighbourhoodSetupDone) {
    // Select a neighbourhood
    selectNeighbourhood().then(() => {
      updateHighlight(currentStepData)
    })
  }

  $: if (browser && isOpen && currentStep === 5) {
    // Select Boomkroonoppervlakte and Gevoelstemperatuur
    selectIndicators().then(() => {
      updateHighlight(currentStepData)
    })
  }

  onMount(() => {
    // TODO: Remove this - temporarily always show tutorial for testing
    if (browser) {
      setTimeout(() => {
        isOpen = true
      }, 2000)
    }
    // Original code:
    // if (browser && !localStorage.getItem('buurtdashboard-tutorial-seen')) {
    //   setTimeout(() => {
    //     isOpen = true
    //   }, 2000)
    // }
  })
</script>

<svelte:window on:keydown={handleKeydown} bind:innerWidth={viewportWidth} bind:innerHeight={viewportHeight} />

{#if isOpen}
  <!-- Overlay with cutout for highlighted element -->
  <div class="tutorial-overlay">
    <!-- Dark overlay using SVG with cutout -->
    <svg class="overlay-svg" viewBox="0 0 {viewportWidth} {viewportHeight}" preserveAspectRatio="none">
      <defs>
        <mask id="spotlight-mask">
          <!-- White = visible (dark overlay), Black = hidden (spotlight) -->
          <rect x="0" y="0" width="100%" height="100%" fill="white" />
          {#if highlightRect}
            <rect
              x={highlightRect.left}
              y={highlightRect.top}
              width={highlightRect.width}
              height={highlightRect.height}
              rx="8"
              fill="black"
            />
          {/if}
        </mask>
      </defs>
      <!-- Dark overlay with mask cutout -->
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <rect
        x="0"
        y="0"
        width="100%"
        height="100%"
        fill="rgba(0, 0, 0, 0.7)"
        mask="url(#spotlight-mask)"
        on:click={closeTutorial}
        style="cursor: pointer;"
      />
    </svg>

    <!-- Highlight border -->
    {#if highlightRect}
      <div
        class="highlight-border"
        style="
          top: {highlightRect.top}px;
          left: {highlightRect.left}px;
          width: {highlightRect.width}px;
          height: {highlightRect.height}px;
        "
      ></div>
    {/if}

    <!-- Tooltip -->
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
      class="tutorial-tooltip"
      style={tooltipStyle}
      on:click|stopPropagation
      role="dialog"
      aria-modal="true"
      aria-labelledby="tutorial-title"
    >
      <button class="close-button" on:click={closeTutorial} aria-label="Sluiten">
        ×
      </button>

      <div class="step-indicator">
        {currentStep + 1} / {totalSteps}
      </div>

      <h3 class="tutorial-title" id="tutorial-title">{currentStepData.title}</h3>
      <p class="tutorial-description">{currentStepData.description}</p>

      <div class="tutorial-navigation">
        {#if !isFirstStep}
          <button class="nav-button prev" on:click={prevStep}>
            ← Vorige
          </button>
        {:else}
          <div></div>
        {/if}

        <button class="nav-button next" on:click={nextStep}>
          {isLastStep ? 'Sluiten' : 'Volgende →'}
        </button>
      </div>

      <div class="progress-dots">
        {#each tutorialSteps as _, i}
          <button
            class="dot"
            class:active={i === currentStep}
            on:click={() => currentStep = i}
            aria-label="Ga naar stap {i + 1}"
          ></button>
        {/each}
      </div>
    </div>
  </div>
{/if}

<style>
  .tutorial-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10000;
    pointer-events: none;
    overflow: hidden;
  }

  .overlay-svg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: auto;
  }

  .highlight-border {
    position: fixed;
    border: 3px solid #35575a;
    border-radius: 8px;
    box-shadow: 0 0 0 4px rgba(53, 87, 90, 0.3), 0 0 20px rgba(53, 87, 90, 0.5);
    pointer-events: none;
    animation: pulse-border 2s ease-in-out infinite;
  }

  @keyframes pulse-border {
    0%, 100% {
      box-shadow: 0 0 0 4px rgba(53, 87, 90, 0.3), 0 0 20px rgba(53, 87, 90, 0.5);
    }
    50% {
      box-shadow: 0 0 0 6px rgba(53, 87, 90, 0.4), 0 0 30px rgba(53, 87, 90, 0.6);
    }
  }

  .tutorial-tooltip {
    position: fixed;
    background: white;
    border-radius: 12px;
    padding: 24px;
    max-width: 360px;
    min-width: 300px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    z-index: 10001;
    pointer-events: auto;
    transition: top 0.4s ease-out, left 0.4s ease-out, right 0.4s ease-out, bottom 0.4s ease-out, transform 0.4s ease-out;
  }

  .close-button {
    position: absolute;
    top: 12px;
    right: 12px;
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #666;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background-color 0.2s;
  }

  .close-button:hover {
    background-color: #f0f0f0;
    color: #333;
  }

  .step-indicator {
    font-size: 12px;
    color: #888;
    margin-bottom: 8px;
  }

  .tutorial-title {
    margin: 0 0 12px 0;
    font-size: 20px;
    color: #35575a;
    padding-right: 24px;
  }

  .tutorial-description {
    margin: 0 0 20px 0;
    font-size: 14px;
    line-height: 1.6;
    color: #555;
  }

  .tutorial-navigation {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .nav-button {
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s;
  }

  .nav-button.prev {
    background: #f0f0f0;
    color: #555;
  }

  .nav-button.prev:hover {
    background: #e0e0e0;
  }

  .nav-button.next {
    background: #35575a;
    color: white;
  }

  .nav-button.next:hover {
    background: #2a4548;
  }

  .progress-dots {
    display: flex;
    justify-content: center;
    gap: 8px;
  }

  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: none;
    background: #ddd;
    cursor: pointer;
    padding: 0;
    transition: all 0.2s;
  }

  .dot:hover {
    background: #bbb;
  }

  .dot.active {
    background: #35575a;
    transform: scale(1.2);
  }

  @media (max-width: 600px) {
    .tutorial-tooltip {
      max-width: calc(100vw - 40px);
      min-width: auto;
      left: 20px !important;
      right: 20px !important;
      top: auto !important;
      bottom: 20px !important;
      transform: none !important;
    }
  }
</style>
