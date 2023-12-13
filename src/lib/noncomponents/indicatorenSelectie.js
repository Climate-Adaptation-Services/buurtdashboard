export const indicatorenSelectie = [
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
    titel:'Groen en grijs openbare ruimte', 
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
    titel:'Koele plekken', 
    attribute:'ATK_KPperc', 
    subtitel:'% koele plekken vanuit de Afstand tot Koelte Kaart',
    plottitel:'% koele plekken', 
    categorie:'Impact en Kwetsbaarheid', 
    color:["#FBDC6C", "#9BF09C", "#00E612"], 
    numerical:true, 
    link:'https://www.klimaateffectatlas.nl/nl/afstand-tot-koeltekaart',
    multiline:false,
    bron:'KEA/TAUW/CBS'
  },
  {
    titel:'Risico paalrot', 
    attribute:'Paal2050H', 
    subtitel:'Risico Paalrot 2050 bij sterke klimaatverandering', 
    categorie:'Impact en Kwetsbaarheid', 
    color:{
      domain:['Zeer laag', 'Laag', 'Midden', 'Hoog', 'Zeer hoog'], 
      range:['#CCCCCC','#FEFEBB','#D0B867','#A26B29','#742600']
    }, 
    klassen:{'Zeer laag':0.8,'Laag':3, 'Midden':6, 'Hoog':15, 'Zeer hoog':10000},
    numerical:false, 
    link:'https://www.klimaateffectatlas.nl/nl/risicokaarten-funderingen',
    multiline:false,
    bron:'KEA/Deltares'
  },
]