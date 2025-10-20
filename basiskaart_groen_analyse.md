# Grondige Data-analyse: Nederlandse Buurt Groen & Grijs Basiskaart

**Dataset:** `basiskaartGroen081025(b10Buurt2024BasiskaartGroen).csv.gz`
**Datum analyse:** Oktober 2025

---

## Dataset Overzicht

### Scope & Schaal
- **14.574 buurten** verspreid over **342 gemeenten** in Nederland
- **Totale gedekte bevolking:** 17.942.915 inwoners
- **Gemiddelde bevolking per buurt:** 1.231 inwoners
- **14.096 bewoonde buurten** (478 hebben nul of zeer lage bevolking - natuurgebieden, industrieterreinen)

### Datastructuur
De dataset bevat 53 kolommen die groene/grijze ruimtelijke kenmerken volgen met dubbele sets (kolommen 8-27 en 28-47), waarschijnlijk verschillende meetmethodologieën of tijdsperiodes.

---

## Analyse van Belangrijkste Metrieken

### 1. Grondgebruik Samenstelling (Landelijke Gemiddelden)

| Categorie          | Percentage | Inzicht                                              |
|--------------------|------------|------------------------------------------------------|
| **Groen**          | 24,99%     | Kwart van het land is groene ruimte                  |
| **Steen/Verhard**  | 27,93%     | Iets meer verhard dan groen                          |
| **Gebouwen**       | 13,20%     | Significante bebouwde omgeving                       |
| **Water**          | 6,10%      | Weerspiegelt Nederland's waterrijke geografie        |
| **Agrarisch**      | 35,58%     | Gevonden in 9.189 gebieden (63% van dataset)         |

**Belangrijkste Bevinding:** Nederland toont een bijna gelijke verdeling tussen groene en verharde oppervlakken, met gebouwen die een matig deel innemen. Landbouwgrond domineert landelijke gebieden.

---

### 2. BKBgraad (Basiskaart Groen Graad)

Dit lijkt een gespecialiseerde groenkwaliteit-meting te zijn:
- **Algemene BKBgraad:** 14,23%
- **Openbare ruimtes:** 10,21%
- **Niet-openbare ruimtes:** 3,47%

**Interpretatie:** Openbare groene ruimtes dragen meer bij aan de "groengraad" dan privéruimtes, wat suggereert dat deze metriek toegankelijkheids- of kwaliteitsfactoren meeweegt.

---

### 3. Gedetailleerde Oppervlakte Samenstelling

| Oppervlaktetype | Gemiddeld % | Opmerkingen                           |
|-----------------|-------------|---------------------------------------|
| **Verhard**     | 27,94%      | Harde oppervlakken (wegen, beton)     |
| **Onverhard**   | 22,30%      | Kale grond, zand                      |
| **Gras**        | 9,45%       | Gazons                                |
| **Struiken**    | 3,24%       | Vegetatie behalve gras                |
| **Halfverhard** | 0,79%       | Grind, doorlatende oppervlakken       |

**Observatie:** Verharde oppervlakken domineren, maar er bestaan aanzienlijke onverharde gebieden. Gras is het primaire groene oppervlaktetype.

---

### 4. Groen per Inwoner

**Gemiddeld: 5.172,83 m² per persoon** (berekend uit 14.096 bewoonde buurten)

**Context:** Deze uitzonderlijk hoge waarde wordt vertekend door:
- Landelijke gebieden met lage bevolkingsdichtheid
- Natuurgebieden met minimale inwoners
- Periurbane groengordels

**Top buurten met meeste groen per inwoner:**
1. **Oostvaardersplassen (Lelystad):** 4.345.115 m²/persoon (natuurgebied, 5 inwoners)
2. **Verspreide huizen Imbosch en Terlet (Rozendaal):** 1.537.521 m²/persoon
3. **Noord duinen (Zandvoort):** 1.467.304 m²/persoon

Dit zijn in wezen beschermde natuurgebieden met symbolische bevolkingsaantallen.

---

### 5. Verdelingspatronen

#### Groendekking Verdeling:
- **Zeer groen (>50%):** 860 buurten (5,9%)
- **Groen (30-50%):** 3.235 buurten (22,2%)
- **Matig (15-30%):** 6.947 buurten (47,7%) ← **Grootste categorie**
- **Laag (<15%):** 3.532 buurten (24,2%)

**Bevinding:** Bijna **de helft van de Nederlandse buurten** heeft matige groendekking (15-30%), wat op evenwichtige ontwikkeling wijst.

#### Steen/Verhard Dekking Verdeling:
- **Zeer verhard (>50%):** 1.268 buurten (8,7%)
- **Verhard (30-50%):** 6.323 buurten (43,4%) ← **Grootste categorie**
- **Matig (15-30%):** 2.378 buurten (16,3%)
- **Laag (<15%):** 4.605 buurten (31,6%)

**Bevinding:** De meeste buurten (43,4%) zijn matig tot sterk verhard (30-50%), wat stedelijke ontwikkelingspatronen weerspiegelt.

---

### 6. Openbare vs. Niet-openbare Ruimte

- **Openbare ruimte:** 37,60%
- **Niet-openbare ruimte:** 49,20%
- **Rest:** ~13% (waarschijnlijk gemengd/ongeclassificeerd)

**Inzicht:** Privéruimte domineert, maar openbare ruimte vormt meer dan een derde van het land, wat aanzienlijke publieke toegankelijkheid aangeeft.

---

## Extreme Gevallen

### Minst Groene Buurten:
1. **Pampusbuurt-West & Pampusbuurt-Oost (Amsterdam):** 0,00% groen
2. **Vogeleiland (Enkhuizen):** 0,00% groen
3. **Muidenbuurt-West (Amsterdam):** 0,01% groen
4. **Buiteneiland (Amsterdam):** 0,03% groen

**Patroon:** Ultra-dichte stadskernen of kunstmatige eilanden met nul vegetatie.

### Meest Bebouwde Buurten:
1. **Moerkapelle kassengebied (Zuidplas):** 67,48% bebouwing
2. **Buitengebied Maasdijk (Westland):** 67,11% bebouwing

**Patroon:** Dit zijn **kassengebieden (Westland)** - agrarische gebouwen domineren. Niet residentiële dichtheid maar agrarische infrastructuur.

### Meest Verharde Buurten:
1. **Buiteneiland (Amsterdam):** 98,63% steen
2. **Arkel-Industriegebied-Noord (Molenlanden):** 81,38% steen

**Patroon:** Industriële zones en infrastructuurknooppunten.

---

## Gemeente-niveau Inzichten

### Groenste Gemeenten:
1. **Rozendaal:** 62,46% groen (welvarend, bosrijk)
2. **Blaricum:** 51,85% groen (villawijken)
3. **Nunspeet:** 47,78% groen (Veluwe bosgebied)

**Patroon:** Welvarende woonbuurten en natuur-toerisme gebieden leiden in groendekking.

### Meest Verstedelijkte Gemeenten:
1. **Sliedrecht:** 48,68% verhard
2. **Capelle aan den IJssel:** 45,29% verhard
3. **Rotterdam:** 44,93% verhard

**Patroon:** Rotterdam metropolitaans gebied domineert, met industriële/haven functies die verharding stimuleren.

---

## Grote Steden Vergelijking (>100.000 inwoners)

| Stad                | Bevolking | Groen % | Steen % | Belangrijkste Kenmerken                                      |
|---------------------|-----------|---------|---------|--------------------------------------------------------------|
| **Amsterdam**       | 931.300   | 19,22%  | 43,16%  | Minst groene grote stad, grachtendicht                       |
| **Rotterdam**       | 670.585   | 27,81%  | 44,93%  | Meest verharde grote stad (havenindustrie)                   |
| **'s-Gravenhage**   | 566.175   | 27,16%  | 42,00%  | Evenwichtig voor hoofdstadfuncties                           |
| **Utrecht**         | 374.200   | 19,73%  | 42,85%  | Weinig groen, veel verharding (dichte middeleeuwse kern)     |
| **Groningen**       | 243.790   | 26,51%  | 21,49%  | **Meest evenwichtige grote stad**                            |
| **Almere**          | 226.425   | 39,98%  | 35,02%  | **Groenste grote stad** (geplande nieuwe stad)               |
| **Apeldoorn**       | 168.225   | 36,48%  | 24,13%  | Groene stad nabij Veluwe natuur                              |
| **Nijmegen**        | 187.050   | 35,41%  | 33,57%  | Heuvelachtig terrein, historische groene planning            |
| **Enschede**        | 161.740   | 28,07%  | 28,69%  | Balans tussen groen en stedelijk                             |
| **'s-Hertogenbosch**| 160.765   | 31,56%  | 32,95%  | Goede groen-verharding balans                                |
| **Leiden**          | 130.095   | 27,40%  | 41,28%  | Historische binnenstad met grachten                          |
| **Maastricht**      | 125.305   | 30,50%  | 32,68%  | Heuvelachtig, groene oevers                                  |
| **Dordrecht**       | 122.090   | 28,37%  | 41,93%  | Waterrijke historische stad                                  |
| **Zoetermeer**      | 128.440   | 36,49%  | 35,89%  | Geplande stad met groenstructuur                             |

### Belangrijkste Inzichten:
- **Amsterdam & Utrecht** hebben de minste groene ruimte onder grote steden (<20%)
- **Almere** (geplande stad, jaren '70-heden) heeft het meeste groen (39,98%)
- **Rotterdam** heeft de hoogste verharding (44,93%) door haveninfrastructuur
- **Groningen** bereikt de beste balans met laagste verharding onder grote steden (21,49%)

---

## Top 10 Groenste Buurten (naar percentage)

1. **Zuid duinen (Zandvoort):** 96,52% groen
2. **Noordzoom Oost (Lelystad):** 96,49% groen
3. **Tafelberger Heide (Huizen):** 95,08% groen
4. **Noord duinen (Zandvoort):** 94,65% groen
5. **Ebenezer Howardpark (Almere):** 93,16% groen
6. **De Groote Peel (Asten):** 91,72% groen
7. **Vogelhorst-Golfbaan Almeerderhout (Almere):** 91,56% groen
8. **Blaricummer Heide (Blaricum):** 91,32% groen
9. **Verspreide huizen bosgebied ten oosten kanaal (Heumen):** 90,85% groen
10. **Meridiaanpark Zuid (Almere):** 90,47% groen

---

## Top 10 Meest Verharde Buurten

1. **Buiteneiland (Amsterdam):** 98,63%
2. **Arkel-Industriegebied-Noord (Molenlanden):** 81,38%
3. **Hoogblokland-Bazeldijk (Molenlanden):** 76,53%
4. **Marathonbuurt-Oost (Amsterdam):** 69,89%
5. **Rapenburg (Amsterdam):** 69,81%
6. **Kornwerderzand (Súdwest-Fryslân):** 69,41%
7. **Industriehaven en omgeving (Harlingen):** 68,81%
8. **Groenmarktkadebuurt (Amsterdam):** 68,05%
9. **Boulevard Midden (Zandvoort):** 66,41%
10. **Handelskade en 's-Gravendeelsedijk (Dordrecht):** 65,61%

---

## Datakwaliteit & Methodologie

### Kolom Duplicatie:
- Kolommen 8-27 weerspiegelen kolommen 28-47 met kleine variaties
- Dit suggereert ofwel:
  - Verschillende meetmethodologieën (bijv. satelliet vs. grondonderzoek)
  - Temporele vergelijking (voor/na)
  - Validatie door dubbelzijdige brondata

### Ontbrekende Data:
- 478 buurten hebben geen bevolkingsgegevens (waarschijnlijk industriële/natuurzones)
- Groen-per-inwoner metriek vertekend door lage-bevolking uitschieters

### Geografische Metadata:
- `Shape_Length` en `Shape_Area` geven polygoon geometrie
- `buurtcode` volgt Nederlandse CBS (Centraal Bureau voor de Statistiek) coderingssysteem

---

## Strategische Inzichten voor Tool Ontwikkeling

### Voor de Buurtdashboard applicatie:

#### 1. Drempelwaarde Aanbevelingen:
- **Groen:** <15% (slecht), 15-30% (matig), 30-50% (goed), >50% (uitstekend)
- **Verharding:** >50% (zeer dicht), 30-50% (stedelijk), 15-30% (suburbaan), <15% (landelijk)

#### 2. Interessante Vergelijkingen:
- Peer stad analyse (steden van vergelijkbare grootte)
- Openbare vs. niet-openbare groene ruimte balans
- Agrarische overgangszones (waar stedelijk en landelijk elkaar ontmoeten)

#### 3. Data Visualisatie Prioriteiten:
- Groen-naar-verharding ratio (leefbaarheid indicator)
- BKBgraad vs. totaal groen (kwaliteit vs. kwantiteit)
- Tijdreeksen als dubbele kolommen temporele data vertegenwoordigen

#### 4. Gebruikersverhalen:
- "Hoe groen is mijn buurt vergeleken met vergelijkbare buurten?"
- "Welke steden balanceren groene en stedelijke ontwikkeling het beste?"
- "Waar zijn de meest extreme stedelijke hitte-eiland risico's?" (weinig groen + veel verharding)

---

## Conclusie

Deze dataset biedt een **uitgebreide ruimtelijke audit van Nederland's groen-grijs balans** op buurtniveau.

### Belangrijkste bevindingen:

1. **Nationale balans is precair:** Groen (25%) loopt nauwelijks achter op verharding (28%)

2. **Grote steden worstelen met groene ruimte:** Amsterdam en Utrecht <20% groen

3. **Geplande steden presteren beter dan historische:** Almere (40% groen) vs. Amsterdam (19%)

4. **Agrarische gebieden blijven dominant:** 63% van de gebieden heeft landbouwgrond

5. **Openbare ruimte is significant:** 38% van het land is publiek toegankelijk

### Toepassingen:

De data is **uitzonderlijk rijk** voor:
- Milieurechtvaardigheidsstudies
- Stedelijk hitte-eiland onderzoek
- Klimaatadaptatie planning
- Leefbaarheidsbeoordelingen
- Groene infrastructuur ontwikkeling
- Ruimtelijke ordeningsbeleid

---

**Databron:** `https://buurtdashboard-data.s3.eu-north-1.amazonaws.com/buurtdashboard-KEA/csvdata/basiskaartGroen081025(b10Buurt2024BasiskaartGroen).csv.gz`

**Analyse uitgevoerd:** Oktober 2025
