export function getIndicatorenLijst(metadata){
  console.log(metadata)

  let indicatorenLijst = []

  // let indicatorenOpCategorie = [...metadata.filter(d => d.Categorie === 'Gebiedskenmerken'), ...metadata.filter(d => d.Categorie === 'Effecten'), ...metadata.filter(d => d.Categorie === 'Kwetsbaarheid')]
  indicatorenLijst = addIndicatorCategorie(indicatorenLijst, metadata.filter(d => d.Categorie === 'Effects'))
  indicatorenLijst = addIndicatorCategorie(indicatorenLijst, metadata.filter(d => d.Categorie === 'Area characteristics'))
  indicatorenLijst = addIndicatorCategorie(indicatorenLijst, metadata.filter(d => d.Categorie === 'Vulnerability'))

  console.log(indicatorenLijst)

  return indicatorenLijst
}

function addIndicatorCategorie(indicatorenLijst, indicatoren){
  // dit is voor de kopjes in de filter dropdown
  indicatorenLijst.push({titel:{'label':indicatoren[0].Categorie, 'disabled':true}})

  indicatoren.forEach(indicator => {
    let klassen = {}
    if(indicator['kwantitatief / categoraal / multiline'] !== 'categoraal'){
      indicator.Domein.split(',').forEach((d,i) => {
        klassen[d] = indicator.Indicatornaamtabel.split(',')[i]
      });
    }else{
      indicator.Domein.split(',').forEach((d,i) => {
        klassen[d] = indicator.klassenthresholds.split(',')[i]
      });
    }

    indicatorenLijst.push({
      titel:indicator.Titel, 
      attribute:indicator.Indicatornaamtabel.split(',')[0], 
      subtitel:indicator.Subtitel, 
      plottitel:indicator['Plot titel (enkel bij kwantitatief)'],
      categorie:indicator.Categorie, 
      color:{
        domain:indicator.Domein.split(','), 
        range:indicator.Kleur.split(',')
      }, 
      klassen:klassen,
      numerical:(indicator['kwantitatief / categoraal / multiline'] === 'Kwantitatief') ? true : false, 
      link:indicator['Link kaartverhaal'],
      multiline:(indicator['kwantitatief / categoraal / multiline'] === 'Multiline') ? true : false,
      bron:indicator.Bron,
      omschrijving:indicator['Tekst vraagteken'],
    })
  })
  return indicatorenLijst
}




// [
//   {
//     titel:{'label':'Gebiedskenmerken', 'disabled':true}
//   },
//   {
//     titel:'Functionele gebieden', 
//     attribute:'Bebouwing', 
//     subtitel:'Indeling in functionele gebieden uit de Basiskaart Groen Grijs', 
//     categorie:'Gebiedskenmerken', 
//     color:{
//       domain:['Bebouwing','Openbaar','Overig','Privé','In transitie','Water'], 
//       range:["#FF7F7E","#D2B87F","#E8BEFF","#B6FFF1","#FFD37F","#B4DAFF"]
//     }, 
//     klassen:{'Bebouwing':'Bebouwing', 'Openbaar':'Openbaar', 'Overig':'Overig', 'Privé':'prive', 'In transitie':'Trans', 'Water':'Water'},
//     numerical:false, 
//     link:'https://www.klimaateffectatlas.nl/nl/basiskaart-groen-en-grijs',
//     multiline:true,
//     bron:'Cobra Groeninzicht',
//     omschrijving:'De statistieken tonen de indeling in functionele gebieden zoals gebruikt in de Basiskaart Groen en Grijs. De verdeling in functionele gebieden is een belangrijke factor voor adaptatiemogelijkheden. In buurten met veel openbaar gebied liggen bijvoorbeeld andere maatregelen voor de hand dan in gebieden met veel tuinen. Ga naar het kaartverhaal voor meer informatie over de indeling in functionele gebieden.',
//   },
//   {
//     titel:'Percentage groen', 
//     attribute:'allGroen', 
//     subtitel:'Percentage groen per buurt, exclusief agrarisch gebied', 
//     plottitel:'% groen',
//     categorie:'Gebiedskenmerken', 
//     color:["#CBCBCB","#9DC182","#63995C"], 
//     numerical:true, 
//     link:'https://www.klimaateffectatlas.nl/nl/basiskaart-groen-en-grijs',
//     multiline:false,
//     bron:'Cobra Groeninzicht',
//     omschrijving:'De statistieken tonen de totale hoeveelheid groen (laag groen + bomen) per buurt. Agrarisch gebied is niet meegenomen in de analyse. Ga naar het kaartverhaal voor een overzicht van de uitgangspunten bij de modellering.',
//   },
//   {
//     titel:'Groen/Grijs openbaar', 
//     attribute:'openbGroen', 
//     subtitel:'Groen in openbaar gebied, exclusief agrarisch gebied', 
//     categorie:'Gebiedskenmerken', 
//     color:{
//       domain:['Boom', 'Laag Groen', 'Grijs'], 
//       range:["#63995C", "#9DC182", "#CBCBCB"]
//     }, 
//     klassen:{'Boom':'openbBoom', 'Laag Groen':'openbGroen', 'Grijs':'openbGrijs'},
//     numerical:false, 
//     link:'https://www.klimaateffectatlas.nl/nl/basiskaart-groen-en-grijs',
//     multiline:true,
//     bron:'Cobra Groeninzicht',
//     omschrijving:"De statistieken tonen het aandeel groen en grijs voor openbaar gebied op basis van de Basiskaart Groengrijs. Voor het onderscheid tussen groen en grijs (versteend) is gebruik gemaakt van luchtfoto's. Agrarisch gebied is niet meegenomen in de analyse. Ga naar het kaartverhaal voor de gehanteerde definitie van niet-openbaar gebied en een overzicht van de uitgangspunten bij de modellering.",
//   },
//   {
//     titel:'Groen/Grijs niet-openbaar', 
//     attribute:'PrivGroen', 
//     subtitel:'Groen in niet-openbaar gebied, exclusief agrarisch gebied', 
//     categorie:'Gebiedskenmerken', 
//     color:{
//       domain:['Boom', 'Laag Groen', 'Grijs'], 
//       range:["#63995C", "#9DC182", "#CBCBCB"]
//     }, 
//     klassen:{'Boom':'privBoom', 'Laag Groen':'privGroen', 'Grijs':'privGrijs'},
//     numerical:false, 
//     link:'https://www.klimaateffectatlas.nl/nl/basiskaart-groen-en-grijs',
//     multiline:true,
//     bron:'Cobra Groeninzicht',
//     omschrijving:"De statistieken tonen het aandeel groen en grijs voor niet-openbaar gebied op basis van de Basiskaart Groengrijs. Voor het onderscheid tussen groen en grijs (versteend) is gebruik gemaakt van luchtfoto's. Agrarisch gebied is niet meegenomen in de analyse. Ga naar het kaartverhaal voor de gehanteerde definitie van niet-openbaar gebied en een overzicht van de uitgangspunten bij de modellering.",
//   },
//   {
//     titel:'Groen/Grijs/Blauw', 
//     attribute:'m2Groen', 
//     subtitel:'Aandeel op basis van Basiskaart Groengrijs, exclusief agrarisch gebied', 
//     categorie:'Gebiedskenmerken', 
//     color:{
//       domain:['Agrarisch', 'Boom', 'Laag Groen', 'Grijs', 'Water'], 
//       range:['#333333', "#63995C", "#9DC182", "#CBCBCB", '#5b93e1']
//     }, 
//     klassen:{'Boom':'allBomen', 'Laag Groen':'allGroenLa', 'Grijs':'allGrijs', 'Water':'Water'},
//     numerical:false, 
//     link:'https://www.klimaateffectatlas.nl/nl/basiskaart-groen-en-grijs',
//     multiline:true,
//     bron:'Cobra Groeninzicht',
//     omschrijving:"De statistieken tonen het aandeel per klasse op basis van de Basiskaart Groengrijs. Voor het onderscheid tussen groen en grijs (versteend) is gebruik gemaakt van luchtfoto's. Agrarisch gebied is niet meegenomen in de analyse. Ga naar het kaartverhaal voor een overzicht van de uitgangspunten bij de modellering.",
//   },
//   {
//     titel:'Ernstige eenzaamheid', 
//     attribute:'ErnstigZee', 
//     subtitel:'Aandeel inwoners dat ernstig eenzaam is', 
//     plottitel:'% ernstig eenzaam',
//     categorie:'Kwetsbaarheid', 
//     color:["#CBCBCB", "#a0b7c7", "steelblue"], 
//     numerical:true, 
//     link:'',
//     multiline:false,
//     bron:'RIVM',
//     omschrijving:'De statistieken tonen het aandeel ernstig eenzamen per buurt.  Deze groep is extra kwetsbaar voor hitte vanwege de beperkte sociale interacties. Dit vergroot het risico op uitdroging en oververhitting bij een hittegolf.  De VZInfo Buurtatlas geeft het RIVM meer informatie over deze indicator.',
//   },
//   {
//     titel:'Moeite met rondkomen', 
//     attribute:'MoeiteMetR', 
//     subtitel:'Aandeel inwoners dat moeite heeft met rondkomen', 
//     plottitel:'% moeite met rondkomen',
//     categorie:'Kwetsbaarheid', 
//     color:["#CBCBCB", "#a0b7c7", "steelblue"], 
//     numerical:true, 
//     link:'',
//     multiline:false,
//     bron:'RIVM',
//     omschrijving:'De statistieken tonen het aandeel ernstig eenzamen per buurt.  Deze groep is extra kwetsbaar voor hitte vanwege de beperkte sociale interacties. Dit vergroot het risico op uitdroging en oververhitting bij een hittegolf. Op VZInfo Buurtatlas geeft het RIVM meer informatie over deze indicator.',
//   },
//   {
//     titel:'Geboortes', 
//     attribute:'Geboorte', 
//     subtitel:'% Geboortes per buurt',
//     plottitel:'% geboortes',
//     categorie:'Gebiedskenmerken', 
//     color:["#CBCBCB", "#a0b7c7", "steelblue"], 
//     numerical:true, 
//     link:'',
//     multiline:false,
//     bron:'CBS',
//     omschrijving:'',
//   },
//   {
//     titel:'Huurwoningen', 
//     attribute:'HuurwTperc', 
//     subtitel:'% Huurwoningen per buurt', 
//     plottitel:'% woningen',
//     categorie:'Gebiedskenmerken', 
//     color:["#CBCBCB", "#a0b7c7", "steelblue"], 
//     numerical:true, 
//     link:'',
//     multiline:false,
//     bron:'CBS',
//     omschrijving:'',
//   },
//   {
//     titel:'Ernstig overgewicht', 
//     attribute:'ErnsOverge',
//     subtitel:'% Personen met ernstig overgewicht per buurt', 
//     plottitel:'% personen',
//     categorie:'Gebiedskenmerken', 
//     color:["#CBCBCB", "#a0b7c7", "steelblue"], 
//     numerical:true, 
//     link:'',
//     multiline:false,
//     bron:'RIVM',
//     omschrijving:'De statistieken tonen het aandeel ernstig eenzamen per buurt.  Deze groep is extra kwetsbaar voor hitte vanwege de beperkte sociale interacties. Dit vergroot het risico op uitdroging en oververhitting bij een hittegolf.  Op VZInfo Buurtatlas geeft het RIVM meer informatie over deze indicator.',
//   },
//   {
//     titel:'Gemiddelde WOZ-waarde', 
//     attribute:'G_WOZ',
//     subtitel:'Gemiddelde WOZ waarde (€)', 
//     plottitel:'Waarde x 1000 euro',
//     categorie:'Gebiedskenmerken', 
//     color:["#CBCBCB", "#a0b7c7", "steelblue"], 
//     numerical:true, 
//     link:'',
//     multiline:false,
//     bron:'CBS (extern)',
//     omschrijving:'De statistieken tonen de gemiddelde WOZ-waardes per buurt op basis van de CBS Wijk en buurtkaart. De WOZ-waardes geeft een indicatie van de sociaal economische status van een buurt. In buurten met een hoge WOZ-waarde beschikkken inwoners doorgaans over meer middelen om zelf adaptatiemaatregelen te treffen. ',
//   },
//   {
//     titel:'Bevolkingsdichtheid', 
//     attribute:'BEV_DICHTH', 
//     subtitel:'Aantal inwoners per km2 ', 
//     plottitel:'Aantal inwoners per km2',
//     categorie:'Gebiedskenmerken', 
//     color:["#CBCBCB", "#9DC182", "#63995C"], 
//     numerical:true, 
//     link:'https://www.klimaateffectatlas.nl/nl/basiskaart-groen-en-grijs',
//     multiline:false,
//     bron:'CBS (extern)',
//     omschrijving:'De statistieken tonen het aantal inwoners per km2. In buurten met een hoge bevolkingsdichtheid is de ruimte voor adaptieve maatregelen vaak beperkt en is de druk op de buitenruimte hoog.',
//   },
//   {
//     titel:{'label':'Klimaateffecten', 'disabled':true}
//   },
//   {
//     titel:'Gevoelstemperatuur', 
//     attribute:'F29_34perc', 
//     subtitel:'Percentage per gevoelstemperatuurklasse', 
//     categorie:'Effecten', 
//     color:{
//       domain:['23 - 28°C', '29 - 34°C', '35 - 40°C', '41 - 49°C'], 
//       range:["#954A86", "#87E3F0", "#FFF469", "#DA2600"]
//     }, 
//     klassen:{'23 - 28°C':'F23_28perc', '29 - 34°C':'F29_34perc', '35 - 40°C':'F35_40perc', '41 - 49°C':'F41_49perc'},
//     numerical:false, 
//     link:'https://www.klimaateffectatlas.nl/nl/hittekaart-gevoelstemperatuur',
//     multiline:true,
//     bron:'Witteveen+Bos',
//     omschrijving:'De statistieken tonen de gevoelstemperatuur in de buitenruimte tijdens een hete zomerdag (1 juli 2015). Dit is een zomerdag die in het huidige klimaat eens in de 5,5 jaar voorkomt. Met name buurten met weinig schaduw en veel verharding warmen sterk op. Ga naar het kaartverhaal voor een overzicht van de uitgangspunten bij de modellering.',
//   },
//   {
//     titel:'Waterdiepte bij hevige bui', 
//     attribute:'perc5_10mm', 
//     subtitel:'Waterdiepte bij hevige bui van 70 mm / 2 uur', 
//     categorie:'Effecten', 
//     color:{
//       domain:['5 - 10mm', '10 - 15mm', '15 - 20mm', '20 - 30mm', '>30mm'], 
//       range:["#B6EEF0", "#74B4E9", "#2084E0", "#1D45B8", "#002674"]
//     }, 
//     klassen:{'5 - 10mm':'perc5_10mm', '10 - 15mm':'perc10_15mm', '15 - 20mm':'perc15_20mm', '20 - 30mm':'perc20_30mm', '>30mm':'perc30mmME'},
//     numerical:false, 
//     link:'https://www.klimaateffectatlas.nl/nl/hittekaart-gevoelstemperatuur',
//     multiline:true,
//     bron:'Deltares / ROR',
//     omschrijving:'De statistieken tonen de waterdiepten die optreden bij een intense zomerbui. Bebouwing, oppervlaktewater en gebieden met minder dan 5 mm worden niet weergegeven. Belangrijke uitgangspunten bij de modellering zijn onder meer een uniforme rioolbergings- en afvoercapaciteit en het gebruik van de hoogtekaart van 2012: Voor gebieden die na 2012 zijn ontwikkeld of aangepast is deze informatie niet bruikbaar. Ga naar het kaartverhaal voor een overzicht van de uitgangspunten bij de modellering.',
//   },
//   {
//     titel:'Grondwaterstand huidig', 
//     attribute:'GLGHuidigMean',
//     subtitel:'Gemiddelde Laagste Grondwaterstand Huidig (m onder maaiveld)', 
//     plottitel:'Grondwaterstand (m onder maaiveld)',
//     categorie:'Effecten', 
//     color:["#CBCBCB", "#a0b7c7", "steelblue"], 
//     numerical:true, 
//     link:'',
//     multiline:false,
//     bron:'NWM',
//     omschrijving:'De statistieken tonen de Gemiddelde Laagste Grondwaterstand zoals gemodelleerd voor het huidige klimaat. De indicator is gemodelleerd met het Nationaal Water Model. De kaarten geven een grof beeld en dienen enkel ter indicatie.',
//   },
//   {
//     titel:'Grondwaterstand 2050 hoog', 
//     attribute:'GLG2050HoogMean',
//     subtitel:'Gemiddelde Laagste Grondwaterstand 2050 hoog (m)', 
//     plottitel:'Verschil grondwaterstand (m)',
//     categorie:'Effecten', 
//     color:["#CBCBCB", "#a0b7c7", "steelblue"], 
//     numerical:true, 
//     link:'',
//     multiline:false,
//     bron:'NWM',
//     omschrijving:'De statistieken tonen de verandering in de Gemiddelde Laagste Grondwaterstand van huidig naar 2050 bij sterke klimaatverandering. De indicator is gemodelleerd met het Nationaal Water Model. De kaarten geven een grof beeld en dienen enkel ter indicatie.',
//   },
//   // {
//   //   titel:'Koele plekken', 
//   //   attribute:'ATK_KPperc', 
//   //   subtitel:'% koele plekken vanuit de Afstand tot Koelte Kaart',
//   //   plottitel:'% koele plekken', 
//   //   categorie:'Impact en Kwetsbaarheid', 
//   //   color:["#FBDC6C", "#9BF09C", "#00E612"], 
//   //   numerical:true, 
//   //   link:'https://www.klimaateffectatlas.nl/nl/afstand-tot-koeltekaart',
//   //   multiline:false,
//   //   bron:'KEA/TAUW/CBS',
//   // omschrijving:'',
//   // },
//   {
//     titel:{'label':'Impact en kwetsbaarheid', 'disabled':true}
//   },
//   {
//     titel:'Risico paalrot huidig', 
//     attribute:'PaalHuidig', 
//     subtitel:'Risico Paalrot in huidig klimaat', 
//     categorie:'Effecten', 
//     color:{
//       domain:['Geen data', 'Zeer laag', 'Laag', 'Midden', 'Hoog', 'Zeer hoog'], 
//       range:['#333333','#CCCCCC','#FEFEBB','#D0B867','#A26B29','#742600']
//     }, 
//     klassen:{'Geen data':0, 'Zeer laag':0.8,'Laag':3, 'Midden':6, 'Hoog':15, 'Zeer hoog':10000},
//     numerical:false, 
//     link:'https://www.klimaateffectatlas.nl/nl/risicokaarten-funderingen',
//     multiline:false,
//     bron:'Deltares',
//     omschrijving:"De statistieken tonen de risico's voor paalrot zoals gemodelleerd voor het huidige klimaat. Het risico wordt berekend door het percentage panden met houten palen te combineren met de gevoeligheid van de locatie voor paalrot. Ga naar het kaartverhaal voor  een overzicht van de uitgangspunten bij de modellering.",
//   },
//   {
//     titel:'Risico paalrot 2050', 
//     attribute:'Paal2050H', 
//     subtitel:'Risico Paalrot 2050 Hoog', 
//     categorie:'Kwetsbaarheid', 
//     color:{
//       domain:['Geen data','Zeer laag','Laag','Midden','Hoog','Zeer hoog'], 
//       range:['#333333','#CCCCCC','#FEFEBB','#D0B867','#A26B29','#742600']
//     }, 
//     klassen:{'Geen data':0, 'Zeer laag':0.8,'Laag':3, 'Midden':6, 'Hoog':15, 'Zeer hoog':10000},
//     numerical:false, 
//     link:'https://www.klimaateffectatlas.nl/nl/risicokaarten-funderingen',
//     multiline:false,
//     bron:'Deltares',
//     omschrijving:"De statistieken tonen de risico's voor paalrot zoals gemodelleerd in 2050 bij sterke klimaatverandering. Door veranderingen in grondwaterstanden kan het risico op paalrot veranderen. Het risico wordt berekend door het percentage panden met houten palen te combineren met de gevoeligheid van de locatie voor paalrot. Ga naar het kaartverhaal voor  een overzicht van de uitgangspunten bij de modellering.",
//   },
//   {
//     titel:'Verschilzetting 2050', 
//     attribute:'Vers2050H', 
//     subtitel:'Risico verschilzetting 2050 bij sterke klimaatverandering', 
//     categorie:'Effecten', 
//     color:{
//       domain:['Geen data','Zeer laag','Laag','Matig','Hoog','Zeer hoog'], 
//       range:['#333333','#CCCCCC','#B3CEE3','#8D96C6','#8857A8','#810F7C']
//     }, 
//     klassen:{'Geen data':0, 'Zeer laag':1.0,'Laag':5.0, 'Matig':10.0, 'Hoog':25.0, 'Zeer hoog':10000},
//     numerical:false, 
//     link:'https://www.klimaateffectatlas.nl/nl/risicokaarten-funderingen',
//     multiline:false,
//     bron:'Deltares',
//     omschrijving:"De statistieken tonen de risico's voor verschilzetting zoals gemodelleerd voor 2050 bij sterke klimaatverandering. Het risico wordt berekend door het percentage panden op staal te combineren met de gevoeligheid van de locatie voor verschilzetting. Ga naar het kaartverhaal voor  een overzicht van de uitgangspunten bij de modellering.",
//   },
//   {
//     titel:'Broze 65+ers', 
//     attribute:'BrozeGezon',
//     subtitel:'Sociale kwetsbaarheid hitte: % broze 65+ers', 
//     plottitel:'% broze 65+ers',
//     categorie:'Kwetsbaarheid', 
//     color:["#CBCBCB", "#a0b7c7", "steelblue"], 
//     numerical:true, 
//     link:'',
//     multiline:false,
//     bron:'RIVM',
//     omschrijving:'De statistieken tonen het aandeel 65%-ers met een broze gezondheid. Deze groep is extra kwetsbaar voor hitte. Het begrip broosheid omvat fysieke gezondheid, mentale gezondheid en sociale gezondheid. Ga naar het kaartverhaal voor meer informatie over de indicator.',
//   },
//   {
//     titel:'Sociaal minimum', 
//     attribute:'P_H_SOCMIN',
//     subtitel:'Sociale kwetsbaarheid hitte: % huishoudens op of rond het sociaal minimum', 
//     plottitel:'% HH rond/onder sociaal minimum',
//     categorie:'Kwetsbaarheid', 
//     color:["#CBCBCB", "#a0b7c7", "steelblue"], 
//     numerical:true, 
//     link:'',
//     multiline:false,
//     bron:'CBS',
//     omschrijving:'De statistieken tonen het aandeel huishoudens dat leeft rond of onder het sociaal minimum. Deze groep is extra kwetsbaar voor hitte. Ga naar het kaartverhaal voor meer informatie over de indicator.',
//   },
// ]