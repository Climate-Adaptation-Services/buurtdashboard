export const indicatorenLijst = [
  {
    titel:'Functionele gebieden', 
    attribute:'Bebouwing', 
    subtitel:'Percentages indeling openbare ruimte', 
    categorie:'Ruimtelijke context', 
    color:{
      domain:['Bebouwing', 'Openbaar', 'Overig', 'Privé', 'In transitie', 'Water'], 
      range:["#FF7F7E", "#D2B87F", "#E8BEFF","#B6FFF1", "#FFD37F", "#B4DAFF"]
    }, 
    klassen:{'Bebouwing':'Bebouwing', 'Openbaar':'Openbaar', 'Overig':'Overig', 'Privé':'prive', 'In transitie':'Trans', 'Water':'Water'},
    numerical:false, 
    link:'https://www.klimaateffectatlas.nl/nl/basiskaart-groen-en-grijs',
    multiline:true,
    bron:'KEA/Cobra'
  },
  {
    titel:'Groen', 
    attribute:'allGroen', 
    subtitel:'Totaal % groen per buurt (laag groen + boom, exclusief agrarisch)', 
    plottitel:'% groen',
    categorie:'Ruimtelijke context', 
    color:["#CBCBCB", "#9DC182", "#63995C"], 
    numerical:true, 
    link:'https://www.klimaateffectatlas.nl/nl/basiskaart-groen-en-grijs',
    multiline:false,
    bron:'KEA/Cobra'
  },
  {
    titel:'Groen/Grijs openbaar', 
    attribute:'openbGroen', 
    subtitel:'% groen openbare ruimte van de buurt zonder agrarisch', 
    categorie:'Ruimtelijke context', 
    color:{
      domain:['Boom', 'Laag Groen', 'Grijs'], 
      range:["#63995C", "#9DC182", "#CBCBCB"]
    }, 
    klassen:{'Boom':'openbBoom', 'Laag Groen':'openbGroen', 'Grijs':'openbGrijs'},
    numerical:false, 
    link:'https://www.klimaateffectatlas.nl/nl/basiskaart-groen-en-grijs',
    multiline:true,
    bron:'KEA/Cobra'
  },
  {
    titel:'Groen/Grijs niet-openbaar', 
    attribute:'PrivGroen', 
    subtitel:'% groen openbare ruimte van de buurt zonder agrarisch', 
    categorie:'Ruimtelijke context', 
    color:{
      domain:['Boom', 'Laag Groen', 'Grijs'], 
      range:["#63995C", "#9DC182", "#CBCBCB"]
    }, 
    klassen:{'Boom':'privBoom', 'Laag Groen':'privGroen', 'Grijs':'privGrijs'},
    numerical:false, 
    link:'https://www.klimaateffectatlas.nl/nl/basiskaart-groen-en-grijs',
    multiline:true,
    bron:'KEA/Cobra'
  },
  {
    titel:'Groen/Grijs/Blauw', 
    attribute:'m2Groen', 
    subtitel:'Aandeel op basis van Basiskaart Groengrijs', 
    categorie:'Ruimtelijke context', 
    color:{
      domain:['Agrarisch', 'Boom', 'Laag Groen', 'Grijs', 'Water'], 
      range:['#333333', "#63995C", "#9DC182", "#CBCBCB", '#5b93e1']
    }, 
    klassen:{'Boom':'allBomen', 'Laag Groen':'allGroenLa', 'Grijs':'allGrijs', 'Water':'Water'},
    numerical:false, 
    link:'https://www.klimaateffectatlas.nl/nl/basiskaart-groen-en-grijs',
    multiline:true,
    bron:'KEA/Cobra'
  },
  {
    titel:'Gevoelstemperatuur', 
    attribute:'F29_34perc', 
    subtitel:'Percentage hittestress', 
    categorie:'Klimaateffecten', 
    color:{
      domain:['23 - 28°C', '29 - 34°C', '35 - 40°C', '41 - 49°C'], 
      range:["#954A86", "#87E3F0", "#FFF469", "#DA2600"]
    }, 
    klassen:{'23 - 28°C':'F23_28perc', '29 - 34°C':'F29_34perc', '35 - 40°C':'F35_40perc', '41 - 49°C':'F41_49perc'},
    numerical:false, 
    link:'https://www.klimaateffectatlas.nl/nl/hittekaart-gevoelstemperatuur',
    multiline:true,
    bron:'KEA/WB/CBS'
  },
  {
    titel:'Waterdiepte neerslag', 
    attribute:'perc5_10mm', 
    subtitel:'Waterdiepte bij kortdurende intense neerslag', 
    categorie:'Klimaateffecten', 
    color:{
      domain:['No data', '5 - 10mm', '10 - 15mm', '15 - 20mm', '20 - 30mm', '>30mm'], 
      range:["#333333", "#B6EEF0", "#74B4E9", "#2084E0", "#1D45B8", "#002674"]
    }, 
    klassen:{'No data':'percNODATA', '5 - 10mm':'perc5_10mm', '10 - 15mm':'perc10_15mm', '15 - 20mm':'perc15_20mm', '20 - 30mm':'perc20_30mm', '>30mm':'perc30mmME'},
    numerical:false, 
    link:'https://www.klimaateffectatlas.nl/nl/hittekaart-gevoelstemperatuur',
    multiline:true,
    bron:'KEA/WB/CBS'
  },
  // {
  //   titel:'Koele plekken', 
  //   attribute:'ATK_KPperc', 
  //   subtitel:'% koele plekken vanuit de Afstand tot Koelte Kaart',
  //   plottitel:'% koele plekken', 
  //   categorie:'Impact en Kwetsbaarheid', 
  //   color:["#FBDC6C", "#9BF09C", "#00E612"], 
  //   numerical:true, 
  //   link:'https://www.klimaateffectatlas.nl/nl/afstand-tot-koeltekaart',
  //   multiline:false,
  //   bron:'KEA/TAUW/CBS'
  // },
  {
    titel:'Risico paalrot', 
    attribute:'PaalHuidig', 
    subtitel:'in huidig klimaat', 
    categorie:'Impact en Kwetsbaarheid', 
    color:{
      domain:['Geen data', 'Zeer laag', 'Laag', 'Midden', 'Hoog', 'Zeer hoog'], 
      range:['#333333','#CCCCCC','#FEFEBB','#D0B867','#A26B29','#742600']
    }, 
    klassen:{'Geen data':0, 'Zeer laag':0.8,'Laag':3, 'Midden':6, 'Hoog':15, 'Zeer hoog':10000},
    numerical:false, 
    link:'https://www.klimaateffectatlas.nl/nl/risicokaarten-funderingen',
    multiline:false,
    bron:'KEA/Deltares'
  },
  {
    titel:'Risico paalrot 2050', 
    attribute:'Paal2050H', 
    subtitel:'bij sterke klimaatverandering', 
    categorie:'Impact en Kwetsbaarheid', 
    color:{
      domain:['Geen data', 'Zeer laag', 'Laag', 'Midden', 'Hoog', 'Zeer hoog'], 
      range:['#333333','#CCCCCC','#FEFEBB','#D0B867','#A26B29','#742600']
    }, 
    klassen:{'Geen data':0, 'Zeer laag':0.8,'Laag':3, 'Midden':6, 'Hoog':15, 'Zeer hoog':10000},
    numerical:false, 
    link:'https://www.klimaateffectatlas.nl/nl/risicokaarten-funderingen',
    multiline:false,
    bron:'KEA/Deltares'
  },
  {
    titel:'Verschilzetting 2050', 
    attribute:'Vers2050H', 
    subtitel:'bij sterke klimaatverandering', 
    categorie:'Impact en Kwetsbaarheid', 
    color:{
      domain:['Geen data', 'Zeer laag', 'Laag', 'Matig', 'Hoog', 'Zeer hoog'], 
      range:['#333333','#CCCCCC','#B3CEE3','#8D96C6','#8857A8','#810F7C']
    }, 
    klassen:{'Geen data':0, 'Zeer laag':1.0,'Laag':5.0, 'Matig':10.0, 'Hoog':25.0, 'Zeer hoog':10000},
    numerical:false, 
    link:'https://www.klimaateffectatlas.nl/nl/risicokaarten-funderingen',
    multiline:false,
    bron:'KEA/Deltares'
  },
  {
    titel:'Ernstige eenzaamheid', 
    attribute:'ErnstigZee', 
    subtitel:'% personen zeer eenzaam per buurt', 
    plottitel:'% personen',
    categorie:'Ruimtelijke context', 
    color:["#CBCBCB", "#a0b7c7", "steelblue"], 
    numerical:true, 
    link:'',
    multiline:false,
    bron:'RIVM'
  },
  {
    titel:'Moeite met rondkomen', 
    attribute:'MoeiteMetR', 
    subtitel:'% personen moeite met rondkomen per buurt', 
    plottitel:'% personen',
    categorie:'Ruimtelijke context', 
    color:["#CBCBCB", "#a0b7c7", "steelblue"], 
    numerical:true, 
    link:'',
    multiline:false,
    bron:'RIVM'
  },
  {
    titel:'Geboortes', 
    attribute:'Geboorte', 
    subtitel:'% Geboortes per buurt',
    plottitel:'% geboortes',
    categorie:'Ruimtelijke context', 
    color:["#CBCBCB", "#a0b7c7", "steelblue"], 
    numerical:true, 
    link:'',
    multiline:false,
    bron:'CBS'
  },
  {
    titel:'Huurwoningen', 
    attribute:'HuurwTperc', 
    subtitel:'% Huurwoningen per buurt', 
    plottitel:'% woningen',
    categorie:'Ruimtelijke context', 
    color:["#CBCBCB", "#a0b7c7", "steelblue"], 
    numerical:true, 
    link:'',
    multiline:false,
    bron:'CBS'
  },
  {
    titel:'Ernstig overgewicht', 
    attribute:'ErnsOverge',
    subtitel:'% Personen met ernstig overgewicht per buurt', 
    plottitel:'% personen',
    categorie:'Ruimtelijke context', 
    color:["#CBCBCB", "#a0b7c7", "steelblue"], 
    numerical:true, 
    link:'',
    multiline:false,
    bron:'RIVM'
  },
  {
    titel:'Gemiddelde WOZ-waarde', 
    attribute:'G_WOZ',
    subtitel:'Gemiddelde WOZ-waarde van woningen x 1000 euro', 
    plottitel:'Waarde x 1000 euro',
    categorie:'Ruimtelijke context', 
    color:["#CBCBCB", "#a0b7c7", "steelblue"], 
    numerical:true, 
    link:'',
    multiline:false,
    bron:'RIVM'
  },
  {
    titel:'Broze 65+ers', 
    attribute:'BrozeGezon',
    subtitel:'Sociale kwetsbaarheid hitte', 
    plottitel:'% broze 65+ers',
    categorie:'Impact en kwetsbaarheid', 
    color:["#CBCBCB", "#a0b7c7", "steelblue"], 
    numerical:true, 
    link:'',
    multiline:false,
    bron:'RIVM'
  },
]