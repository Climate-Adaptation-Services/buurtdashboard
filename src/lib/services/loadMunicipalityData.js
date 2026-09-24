import { get } from "svelte/store"
import { dsvFormat } from "d3-dsv"
import { gunzipSync, strFromU8 } from "fflate"
import { allNeighbourhoodsJSONData, neighbourhoodCodeAbbreviation, municipalityCodeAbbreviation } from "$lib/stores"
import { buildMunicipalityCsvUrl } from "$lib/datasets"

/**
 * Laadt de buurtgegevens van één gemeente en voegt ze toe aan de features die
 * al in allNeighbourhoodsJSONData zitten.
 *
 * Voorheen werd de landelijke CSV in één keer ingeladen: 14.574 buurten x 257
 * kolommen, goed voor ruim 220 MB geheugen. Daardoor schoot iOS Safari het
 * tabblad af. Het dashboard toont er maar één gemeente van tegelijk, en
 * Nederland-brede cijfers komen uit static/nederland-aggregates.json.
 */

// Welke gemeenten al binnen zijn, zodat er niet opnieuw geladen wordt
const loaded = new Set()
// Lopende verzoeken, zodat twee snelle selecties niet dubbel ophalen
const inFlight = new Map()

// Deze kolommen worden als getal gebruikt en komen als tekst uit de CSV
const NUMERIC_PROPERTIES = ["m2GroenPI", "F1865ErnsOv", "F18ErnstigZ", "BrozeGezon", "G_WOZ", "HuurwTperc", "perc_groen_zonder_agr"]

export function isMunicipalityLoaded(municipalityCode) {
  return loaded.has(municipalityCode)
}

export function resetMunicipalityCache() {
  loaded.clear()
  inFlight.clear()
}

async function fetchMunicipalityRows(municipalityCode) {
  const url = buildMunicipalityCsvUrl(municipalityCode)
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Gemeentebestand ${municipalityCode} niet gevonden (${response.status})`)
  }

  const buffer = await response.arrayBuffer()
  const text = url.endsWith(".gz")
    ? strFromU8(gunzipSync(new Uint8Array(buffer)))
    : new TextDecoder().decode(buffer)

  return dsvFormat(";").parse(text.replace(/^﻿/, ""))
}

function mergeRowIntoProperties(properties, row) {
  const merged = { ...properties, ...row }

  for (const prop of NUMERIC_PROPERTIES) {
    if (merged[prop] !== undefined) {
      const parsed = parseFloat(merged[prop])
      merged[prop] = isNaN(parsed) ? null : parsed
    }
  }

  // Zelfde uitzondering als in prepareJSONData
  if (merged["BEV_DICHTH"] < 0) merged["BEV_DICHTH"] = null

  return merged
}

/**
 * Zorgt dat de gegevens van deze gemeente geladen zijn. Meerdere aanroepen voor
 * dezelfde gemeente delen één verzoek; al geladen gemeenten doen niets.
 *
 * @param {string|null} municipalityCode
 * @returns {Promise<boolean>} of er data is (of al was)
 */
export async function ensureMunicipalityDataLoaded(municipalityCode) {
  if (!municipalityCode) return false
  if (loaded.has(municipalityCode)) return true
  if (inFlight.has(municipalityCode)) return inFlight.get(municipalityCode)

  const request = (async () => {
    const rows = await fetchMunicipalityRows(municipalityCode)

    const codeColumn = get(neighbourhoodCodeAbbreviation)
    const municipalityColumn = get(municipalityCodeAbbreviation)

    const rowsByCode = new Map()
    for (const row of rows) {
      const code = row[codeColumn] || row["buurtcode"] || row["Buurtcode"]
      if (code) rowsByCode.set(code, row)
    }

    const current = get(allNeighbourhoodsJSONData)
    if (!current?.features) {
      throw new Error("Buurtgeometrie is nog niet geladen")
    }

    // Nieuwe array zodat afgeleide stores opnieuw berekenen; features buiten deze
    // gemeente blijven hetzelfde object en kosten dus niets extra.
    const features = current.features.map((feature) => {
      if (feature?.properties?.[municipalityColumn] !== municipalityCode) return feature
      const row = rowsByCode.get(feature.properties[codeColumn])
      if (!row) return feature
      return { ...feature, properties: mergeRowIntoProperties(feature.properties, row) }
    })

    allNeighbourhoodsJSONData.set({ type: "FeatureCollection", features })
    loaded.add(municipalityCode)
    return true
  })()

  inFlight.set(municipalityCode, request)
  try {
    return await request
  } finally {
    inFlight.delete(municipalityCode)
  }
}
