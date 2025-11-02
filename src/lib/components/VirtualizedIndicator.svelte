<script>
  import { onMount } from "svelte"
  import IndicatorContent from "./IndicatorContent.svelte"

  export let indicatorHeight
  export let indicator
  export let isLoading = false

  let isVisible = false
  let hasBeenVisible = false
  let containerElement

  // Intersection Observer to detect when indicator enters viewport
  onMount(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Mark as visible when it enters viewport with some margin
          if (entry.isIntersecting) {
            isVisible = true
            hasBeenVisible = true
          } else {
            // Unmount if it's far away to stop expensive simulations
            const rect = entry.boundingClientRect
            const viewportHeight = window.innerHeight

            // Unrender if it's more than 2 viewports away
            if (hasBeenVisible && (rect.top > viewportHeight * 2 || rect.bottom < -viewportHeight * 2)) {
              isVisible = false
            }
          }
        })
      },
      {
        // Start loading when indicator is 1 viewport away
        rootMargin: "100% 0px 100% 0px",
        threshold: 0,
      },
    )

    if (containerElement) {
      observer.observe(containerElement)
    }

    return () => {
      if (containerElement) {
        observer.unobserve(containerElement)
      }
    }
  })
</script>

<div bind:this={containerElement} style="height: {indicatorHeight}px; width: 100%;">
  {#if isVisible}
    <IndicatorContent {indicatorHeight} {indicator} {isLoading} />
  {:else}
    <!-- Placeholder skeleton while not visible -->
    <div class="indicator-placeholder" style="height: {indicatorHeight}px;">
      <div class="placeholder-content">
        <div class="skeleton-bar"></div>
      </div>
    </div>
  {/if}
</div>

<style>
  .indicator-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f8f8f8;
    border: 1px solid #e0e0e0;
    box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  }

  .placeholder-content {
    width: 80%;
    padding: 20px;
  }

  .skeleton-bar {
    height: 40px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
    border-radius: 8px;
  }

  @keyframes loading {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
</style>
