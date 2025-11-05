/**
 * LeafletMapManager - Handles all Leaflet map integration logic
 * Extracted from Map.svelte to improve organization and maintainability
 */

export class LeafletMapManager {
  constructor() {
    this.L = null
    this.leafletMap = null
    this.mapContainer = null
    this.projectionUpdateCounter = 0
    this.updateProjectionTimeout = null

    // Track current operation for different transition speeds
    this.isZooming = false
    this.isPanning = false

    // Track previous selections to detect what actually changed
    this.previousMunicipalitySelection = null
    this.previousNeighbourhoodSelection = null

    // Callbacks for communicating with parent component
    this.onProjectionUpdate = null
    this.onStateChange = null
  }

  /**
   * Initialize Leaflet library (async import to avoid SSR issues)
   */
  async initializeLeaflet() {
    if (!this.L) {
      this.L = (await import("leaflet")).default
    }
    return this.L
  }

  /**
   * Create a Leaflet-synced D3 projection
   */
  createLeafletSyncedProjection() {
    if (!this.leafletMap) return null

    return {
      stream: function (stream) {
        return {
          point: function (x, y) {
            const point = this.leafletMap.latLngToContainerPoint([y, x])
            stream.point(point.x, point.y)
          }.bind(this),
          lineStart: function () {
            stream.lineStart()
          },
          lineEnd: function () {
            stream.lineEnd()
          },
          polygonStart: function () {
            stream.polygonStart()
          },
          polygonEnd: function () {
            stream.polygonEnd()
          },
        }
      }.bind(this),
    }
  }

  /**
   * Initialize the Leaflet map with proper configuration
   */
  initializeMap(mapContainer, mapWidth, mapHeight) {
    if (!this.L || !mapContainer || this.leafletMap) return false

    this.mapContainer = mapContainer

    this.leafletMap = this.L.map(mapContainer, {
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      boxZoom: true,
      keyboard: true,
      dragging: true,
      tap: true,
      touchZoom: true,
      // Enhanced mobile support
      bounceAtZoomLimits: false,
    })

    // Add a subtle tile layer
    this.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      opacity: 0.7,
      attribution: "",
    }).addTo(this.leafletMap)

    // Ensure Leaflet map can receive wheel events
    this.leafletMap.getContainer().style.pointerEvents = "auto"

    // Make Leaflet map instance available globally for tooltip positioning
    window.leafletMapInstance = this.leafletMap

    // Add event listeners
    this.setupEventListeners()

    return true
  }

  /**
   * Setup all Leaflet event listeners
   */
  setupEventListeners() {
    if (!this.leafletMap) return

    this.leafletMap.on("zoomstart", this.handleZoomStart.bind(this))
    this.leafletMap.on("zoom", this.updateProjection.bind(this))
    this.leafletMap.on("zoomanim", this.updateProjection.bind(this)) // Fires continuously during zoom animation
    this.leafletMap.on("zoomend", this.handleZoomEnd.bind(this))
    this.leafletMap.on("movestart", this.handleMoveStart.bind(this))
    this.leafletMap.on("move", this.updateProjection.bind(this)) // Throttled updates during panning
    this.leafletMap.on("moveend", this.handleMoveEnd.bind(this))
    this.leafletMap.on("viewreset", this.updateProjection.bind(this))
  }

  /**
   * Event handlers for better organization
   */
  handleZoomStart() {
    this.isZooming = true
    this.isPanning = false
    this.updateProjectionImmediate()
    this.notifyStateChange()
  }

  handleZoomEnd() {
    this.isZooming = false
    this.isPanning = false  // Make sure both are false after zoom ends
    this.updateProjection()
    this.notifyStateChange()
  }

  handleMoveStart() {
    // Only set panning if we're not currently zooming
    if (!this.isZooming) {
      this.isPanning = true
      this.updateProjectionImmediate()
      this.notifyStateChange()
    }
  }

  handleMoveEnd() {
    // Only reset panning if we're not zooming
    if (!this.isZooming) {
      this.isPanning = false
      this.notifyStateChange()
    }
    this.updateProjection()
  }

  /**
   * Immediate update for zoom/pan start - no delay
   */
  updateProjectionImmediate() {
    this.projectionUpdateCounter++
    if (this.onProjectionUpdate) {
      this.onProjectionUpdate(this.projectionUpdateCounter)
    }
  }

  /**
   * Throttled update for continuous events
   */
  updateProjection() {
    // Use requestAnimationFrame for smooth updates during animation
    if (this.updateProjectionTimeout) {
      cancelAnimationFrame(this.updateProjectionTimeout)
    }
    this.updateProjectionTimeout = requestAnimationFrame(() => {
      // Trigger reactive update by incrementing counter
      this.projectionUpdateCounter++
      if (this.onProjectionUpdate) {
        this.onProjectionUpdate(this.projectionUpdateCounter)
      }
      this.updateProjectionTimeout = null
    })
  }

  /**
   * Notify parent component of state changes
   */
  notifyStateChange() {
    if (this.onStateChange) {
      this.onStateChange({
        isZooming: this.isZooming,
        isPanning: this.isPanning
      })
    }
  }

  /**
   * Fit map to bounds of provided GeoJSON data
   */
  fitMapToBounds(geoJsonData) {
    if (!this.leafletMap || !geoJsonData) return

    const bounds = this.L.geoJSON(geoJsonData).getBounds()
    if (bounds.isValid()) {
      this.leafletMap.fitBounds(bounds, { padding: [10, 10] })
    }
  }

  /**
   * Handle municipality/neighborhood selection changes
   */
  handleSelectionChange(municipalitySelection, neighbourhoodSelection, currentJSONData, isUpdatingIndicators = false) {
    if (!this.leafletMap || !currentJSONData) return

    // Skip zoom if we're in the middle of updating indicators (temporary clear/restore)
    if (isUpdatingIndicators) return

    const municipalityChanged = municipalitySelection !== this.previousMunicipalitySelection
    const neighbourhoodChanged = neighbourhoodSelection !== this.previousNeighbourhoodSelection

    // Check if this is initial load (both previous values were null/undefined)
    const isInitialLoad = (this.previousMunicipalitySelection === null || this.previousMunicipalitySelection === undefined) &&
                          (this.previousNeighbourhoodSelection === null || this.previousNeighbourhoodSelection === undefined)

    // Zoom to fit bounds when:
    // 1. Municipality was deselected (set to null) - return to Nederland view (always)
    // 2. Initial load with URL params (both previous were null) - zoom to selected area
    // 3. Municipality changed to a different value AND neighborhood didn't change
    if (municipalityChanged) {
      // If municipality was deselected (null), always zoom out to Nederland
      if (municipalitySelection === null) {
        this.fitMapToBounds(currentJSONData)
      }
      // If initial load (from URL params), always zoom to the selected area
      else if (isInitialLoad) {
        this.fitMapToBounds(currentJSONData)
      }
      // If municipality was selected/changed to a new value, only zoom if neighborhood didn't change
      else if (!neighbourhoodChanged) {
        this.fitMapToBounds(currentJSONData)
      }
    }
    // Don't zoom if only neighborhood changed

    this.previousMunicipalitySelection = municipalitySelection
    this.previousNeighbourhoodSelection = neighbourhoodSelection
  }

  /**
   * Initialize map with data when ready
   */
  initializeWithData(currentJSONData) {
    if (currentJSONData && currentJSONData.features) {
      this.fitMapToBounds(currentJSONData)
      // Trigger initial projection update after fitting bounds
      setTimeout(() => {
        this.updateProjection()
      }, 100)
    }
  }

  /**
   * Get the Leaflet map instance
   */
  getMap() {
    return this.leafletMap
  }

  /**
   * Check if Leaflet library is initialized
   */
  isLeafletReady() {
    return !!this.L
  }

  /**
   * Get current zoom/pan state
   */
  getState() {
    return {
      isZooming: this.isZooming,
      isPanning: this.isPanning
    }
  }

  /**
   * Set callback for projection updates
   */
  setProjectionUpdateCallback(callback) {
    this.onProjectionUpdate = callback
  }

  /**
   * Set callback for state changes
   */
  setStateChangeCallback(callback) {
    this.onStateChange = callback
  }

  /**
   * Cleanup method
   */
  destroy() {
    if (this.leafletMap) {
      this.leafletMap.remove()
      this.leafletMap = null
    }
    if (this.updateProjectionTimeout) {
      cancelAnimationFrame(this.updateProjectionTimeout)
      this.updateProjectionTimeout = null
    }
    // Clear global reference
    if (window.leafletMapInstance === this.leafletMap) {
      window.leafletMapInstance = null
    }
  }
}