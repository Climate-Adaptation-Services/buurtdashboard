-- SQL to update tekst_vraagteken for default-nl config
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/wmuusdrtsfjbzhetrciu/sql/new
-- 
-- NOTE: You may need to run this for BOTH tables:
-- 1. indicators (dev/draft version)
-- 2. indicators_published (published version that the app uses)

-- First, let's update the indicators table (dev version)
UPDATE indicators SET tekst_vraagteken = 'Deze percentages laten zien hoe hoog de gevoelstemperatuur in de buitenruimte wordt op een hete, vrijwel windstille zomerdag. Vooral buurten met weinig schaduw en veel verharding warmen sterk op. De lengte van de balkjes wordt bepaald door het aandeel buitenruimte: water en gebouwen worden niet gevuld. Wil je weten waarop deze percentages zijn gebaseerd? Ga dan naar het kaartverhaal.'
WHERE title = 'Gevoelstemperatuur' AND dashboard_config_id = (SELECT id FROM dashboard_configs WHERE slug = 'default-nl');

UPDATE indicators SET tekst_vraagteken = 'Deze statistieken laten zien welke waterdiepte ontstaat bij een hevige zomerbui. De grafieken tonen het percentage van een gebied per waterdiepteklasse. Gebouwen, oppervlaktewater en gebieden met minder dan 5 cm worden niet getoond met gekleurde balkjes. De statistieken gaan uit van een gelijke rioolbergings- en afvoercapaciteit en van de hoogtekaart van 2012. Dat betekent dat deze informatie niet bruikbaar is voor gebieden die na 2012 zijn ontwikkeld of aangepast. Wil je meer weten over de achtergrond van deze statistieken? Ga dan naar het kaartverhaal.'
WHERE title = 'Waterdiepte bij hevige bui' AND dashboard_config_id = (SELECT id FROM dashboard_configs WHERE slug = 'default-nl');

UPDATE indicators SET tekst_vraagteken = 'Deze statistieken laten de Gemiddelde Laagste Grondwaterstand (GLG) zien voor het huidige klimaat. De getallen tonen het gemiddelde aantal meters onder het maaiveld per buurt. De GLG is gemodelleerd met het Nationaal Water Model. De kaarten geven een grof beeld en zijn dus alleen bedoeld ter indicatie. Wil je meer informatie over deze statistieken? Ga dan naar het kaartverhaal.'
WHERE title = 'Lage grondwaterstand' AND dashboard_config_id = (SELECT id FROM dashboard_configs WHERE slug = 'default-nl');

UPDATE indicators SET tekst_vraagteken = 'Deze statistieken laten zien hoe de Gemiddelde Laagste Grondwaterstand (GLG) tussen nu en 2050 verandert bij sterke klimaatverandering. De GLG is gemodelleerd met het Nationaal Water Model. De kaarten geven een grof beeld en zijn dus alleen bedoeld ter indicatie. Wil je meer informatie over deze statistieken? Ga dan naar het kaartverhaal.'
WHERE title = 'Lage grondwaterstand | 2050 hoog' AND dashboard_config_id = (SELECT id FROM dashboard_configs WHERE slug = 'default-nl');

UPDATE indicators SET tekst_vraagteken = 'Deze statistieken laten de laagste grondwaterstand (LG3) zien voor het huidige klimaat op basis van het extreem droge jaar 1976. De getallen tonen het gemiddelde aantal meters onder het maaiveld per buurt. De LG3 is gemodelleerd met het Nationaal Water Model. De kaarten geven een grof beeld en zijn dus alleen bedoeld ter indicatie. Wil je meer informatie over deze statistieken? Ga dan naar het kaartverhaal.'
WHERE title = 'Extreem lage grondwaterstand ' AND dashboard_config_id = (SELECT id FROM dashboard_configs WHERE slug = 'default-nl');

UPDATE indicators SET tekst_vraagteken = 'Deze statistieken laten de Gemiddelde Hoogste Grondwaterstand (GHG) zien voor het huidige klimaat. Dit is de maatgevend voor een natte situatie. De getallen tonen het gemiddelde aantal meters onder het maaiveld per buurt. De GHG is gemodelleerd met het Nationaal Water Model. De kaarten geven een grof beeld en zijn dus alleen bedoeld ter indicatie. Wil je meer informatie over deze statistieken? Ga dan naar het kaartverhaal.'
WHERE title = 'Hoge grondwaterstand ' AND dashboard_config_id = (SELECT id FROM dashboard_configs WHERE slug = 'default-nl');

UPDATE indicators SET tekst_vraagteken = 'Deze statistieken laten de maximale grondwaterstand (zogenaamde HG3) zien bij het huidige klimaat. Dit is de maximale grondwaterstand die over een periode van 100 jaar (1911-2011) gemodelleerd is. Dit is de maatgevende grondwaterstand. De getallen tonen het aantal meters onder het maaiveld. De GHG is gemodelleerd met het Nationaal Water Model. De kaarten geven een grof beeld en zijn dus alleen bedoeld ter indicatie. Wil je meer informatie over deze statistieken? Ga dan naar het kaartverhaal.'
WHERE title = 'Extreem hoge grondwaterstand ' AND dashboard_config_id = (SELECT id FROM dashboard_configs WHERE slug = 'default-nl');

UPDATE indicators SET tekst_vraagteken = 'Deze statistieken laten de risico''s op paalrot zien in het huidige klimaat. Het risico wordt berekend door het percentage panden met houten palen op een locatie te combineren met de gevoeligheid van die locatie voor paalrot. Wil je meer weten over de achtergrond van deze statistieken? Ga dan naar het kaartverhaal.'
WHERE title = 'Risico Paalrot huidig' AND dashboard_config_id = (SELECT id FROM dashboard_configs WHERE slug = 'default-nl');

UPDATE indicators SET tekst_vraagteken = 'Deze statistieken laten zien wat in 2050 de risico''s op paalrot zijn als het klimaat sterk verandert. Door veranderingen in grondwaterstanden kan het risico op paalrot veranderen. Het risico wordt berekend door het percentage panden met houten palen op een locatie te combineren met de gevoeligheid van die locatie voor paalrot. Wil je meer weten over de achtergrond van deze statistieken? Ga dan naar het kaartverhaal.'
WHERE title = 'Risico Paalrot 2050 hoog' AND dashboard_config_id = (SELECT id FROM dashboard_configs WHERE slug = 'default-nl');

UPDATE indicators SET tekst_vraagteken = 'Deze statistieken laten de risico''s zien voor verschilzetting in 2050 bij sterke klimaatverandering. Het risico wordt berekend door het percentage panden op staal op een locatie te combineren met de gevoeligheid van die locatie voor verschilzetting. Wil je meer weten over de achtergrond van deze statistieken? Ga dan naar het kaartverhaal.'
WHERE title = 'Risico Verschilzetting 2050H' AND dashboard_config_id = (SELECT id FROM dashboard_configs WHERE slug = 'default-nl');

UPDATE indicators SET tekst_vraagteken = 'Deze statistieken laten het percentage schaduw zien op wandel- en fietspaden. De schaduwkaart gaat uit van de schaduw op 21 juni om 15:30 uur, omdat dit de langste dag van het jaar is met de kortste schaduwen. In de Maatlat groene klimaatadaptieve gebouwde omgeving wordt hiervoor een streefwaarde van 30% op buurtniveau genoemd. De fiets- en wandelpaden komen uit de Basiskaart Grootschalige Topografie. Wil je meer informatie over deze statistieken? Ga dan naar het kaartverhaal.'
WHERE title = 'Schaduw wandel- en fietspaden' AND dashboard_config_id = (SELECT id FROM dashboard_configs WHERE slug = 'default-nl');

UPDATE indicators SET tekst_vraagteken = 'Deze statistieken toont welke waterdiepten kunnen voorkomen bij een overstroming met een extreem kleine kans (1:100.000 jaar). Per diepteklasse verschillen de gevolgen. Ook de mogelijke maatregelen voor gevolgbeperking verschillen per diepteklasse. Wil je meer informatie over deze statistieken? Ga dan naar het kaartverhaal.'
WHERE title = 'Maximale overstromingsdiepte' AND dashboard_config_id = (SELECT id FROM dashboard_configs WHERE slug = 'default-nl');

UPDATE indicators SET tekst_vraagteken = 'Deze statistieken tonen hoeveel % van de gebouwen in de buurt een droge verdieping heeft bij een overstroming met een extreem kleine kans (1:100.000 jaar). Deze informatie kan interessant zijn bij het verkennen van maatregelen bij een diepe overstroming. Wil je meer informatie over deze statistieken? Ga dan naar het kaartverhaal.'
WHERE title = 'Droge verdiepingen' AND dashboard_config_id = (SELECT id FROM dashboard_configs WHERE slug = 'default-nl');

UPDATE indicators SET tekst_vraagteken = 'Deze statistieken laten zien wat het totale oppervlakte en percentage boomkroonoppervlakte is per buurt. Voor het bepalen van het boomkroonoppervlakte is gebruik gemaakt van het Actueel Hoogtebestand Nederland als broninformatie. Meer informatie over de gevolgde methode vind je in het kaartverhaal.'
WHERE title = 'Boomkroonoppervlakte' AND dashboard_config_id = (SELECT id FROM dashboard_configs WHERE slug = 'default-nl');

UPDATE indicators SET tekst_vraagteken = 'Deze statistieken laten zien wat het percentage boomkroonoppervlakte is binnen het openbare gebied. Voor het bepalen van het boomkroonoppervlakte is gebruik gemaakt van het Actueel Hoogtebestand Nederland als broninformatie. Voor het bepalen van het openbare gebied is gebruik gemaakt van informatie uit basisregistraties. Meer informatie over de gevolgde methode vind je in het kaartverhaal.'
WHERE title = 'Boomkroonoppervlakte openbaar' AND dashboard_config_id = (SELECT id FROM dashboard_configs WHERE slug = 'default-nl');

UPDATE indicators SET tekst_vraagteken = 'Deze statistieken laten zien wat het percentage boomkroonoppervlakte is binnen het niet-openbare gebied. Voor het bepalen van het boomkroonoppervlakte is gebruik gemaakt van het Actueel Hoogtebestand Nederland als broninformatie. Voor het bepalen van het niet-openbare gebied is gebruik gemaakt van informatie uit basisregistraties. Meer informatie over de gevolgde methode vind je in het kaartverhaal.'
WHERE title = 'Boomkroonoppervlakte niet-openbaar ' AND dashboard_config_id = (SELECT id FROM dashboard_configs WHERE slug = 'default-nl');

UPDATE indicators SET tekst_vraagteken = 'Deze statistieken tonen het percentage groen op basis van de Basiskaart Groen en verharding. Uit de Totaalkaart worden de gebieden met boomkroonbedekking, struiken en onverhard - gras opgeteld en weergeven als percentage van het totale landoppervlakte. Agrarisch gebied is niet als groen meegenomen. De klasse onverhard is ook niet als groen meegenomen, hoewel deze wel groen kan zijn. Meer informatie over de gevolgde methode vind je in het kaartverhaal.'
WHERE title = 'Groen' AND dashboard_config_id = (SELECT id FROM dashboard_configs WHERE slug = 'default-nl');

UPDATE indicators SET tekst_vraagteken = 'Deze statistieken tonen het percentage groen in het openbaar gebied op basis van de Basiskaart Groen en verharding. Uit de Totaalkaart worden de gebieden met boomkroonbedekking, struiken en onverhard - gras opgeteld. Agrarisch gebied is niet als groen meegenomen. De klasse onverhard is ook niet als groen meegenomen, hoewel deze wel groen kan zijn. Voor het bepalen van het openbare gebied is gebruik gemaakt van informatie uit basisregistraties. Meer informatie over de gevolgde methode vind je in het kaartverhaal via de knop meer info.'
WHERE title = 'Groen openbaar' AND dashboard_config_id = (SELECT id FROM dashboard_configs WHERE slug = 'default-nl');

UPDATE indicators SET tekst_vraagteken = 'Deze statistieken tonen het percentage groen in niet-openbaar gebied op basis van de Basiskaart Groen en verharding. Uit de Totaalkaart worden de gebieden met boomkroonbedekking, struiken en onverhard - gras opgeteld. Agrarisch gebied is niet als groen meegenomen. De klasse onverhard is ook niet als groen meegenomen, hoewel deze wel groen kan zijn. Voor het bepalen van het niet-openbare gebied is gebruik gemaakt van informatie uit basisregistraties. Meer informatie over de gevolgde methode vind je in het kaartverhaal via de knop meer info.'
WHERE title = 'Groen niet-openbaar' AND dashboard_config_id = (SELECT id FROM dashboard_configs WHERE slug = 'default-nl');

UPDATE indicators SET tekst_vraagteken = 'Deze statistieken tonen het percentage verharding op basis van de Basiskaart Groen en verharding. Uit de landbedekkingskaart is de klasse verhard gebruikt en weergegeven als percentage van het totale landoppervlakte. Er is enkel gekeken naar de buitenruimte: gebouwen zijn niet als verhard geclassificeerd. Meer informatie over de gevolgde methode vind je in het kaartverhaal via de knop meer info.'
WHERE title = 'Verharding ' AND dashboard_config_id = (SELECT id FROM dashboard_configs WHERE slug = 'default-nl');

UPDATE indicators SET tekst_vraagteken = 'Deze statistieken tonen het percentage verharding voor het openbare gebied op basis van de Basiskaart Groen en verharding. Uit de landbedekkingskaart is de klasse verhard gebruikt. Er is enkel gekeken naar de buitenruimte: gebouwen zijn niet als verhard geclassificeerd. Voor het bepalen van het openbare gebied is gebruik gemaakt van informatie uit basisregistraties. Meer informatie over de gevolgde methode vind je in het kaartverhaal via de knop meer info.'
WHERE title = 'Verharding openbaar' AND dashboard_config_id = (SELECT id FROM dashboard_configs WHERE slug = 'default-nl');

UPDATE indicators SET tekst_vraagteken = 'Deze statistieken tonen het percentage verharding voor het niet-openbare gebied op basis van de Basiskaart Groen en verharding. Uit de landbedekkingskaart is de klasse verhard gebruikt. Er is enkel gekeken naar de buitenruimte: gebouwen zijn niet als verhard geclassificeerd. Voor het bepalen van het niet-openbare gebied is gebruik gemaakt van informatie uit basisregistraties. Meer informatie over de gevolgde methode vind je in het kaartverhaal via de knop meer info.'
WHERE title = 'Verharding niet-openbaar' AND dashboard_config_id = (SELECT id FROM dashboard_configs WHERE slug = 'default-nl');

UPDATE indicators SET tekst_vraagteken = 'De kaart toont het percentage water per buurt op basis van de Basiskaart Verharding en Groen. Uit de landbedekkingskaart is de klasse water gebruikt. Meer informatie over de gevolgde methode vind je in het kaartverhaal via de knop meer info.'
WHERE title = 'Water' AND dashboard_config_id = (SELECT id FROM dashboard_configs WHERE slug = 'default-nl');

UPDATE indicators SET tekst_vraagteken = 'De statistieken tonen de verdeling van de landbedekking op basis van de Basiskaart Groen en verharding. Uit de Totaalkaart worden de klassen onverhard, onverhard - gras, onverhard - struiken, halfverhard, verhard en gebouwen getoond als percentage van het totale landoppervlakte. Meer informatie over de gevolgde methode vind je in het kaartverhaal.'
WHERE title = 'Landbedekking ' AND dashboard_config_id = (SELECT id FROM dashboard_configs WHERE slug = 'default-nl');

UPDATE indicators SET tekst_vraagteken = 'De statistieken tonen de verdeling tussen openbaar gebied, niet-openbaar gebied en gebouwen op basis van de Basiskaart Groen en Verharding. Hiervoor wordt de kaart openbaar gebied en niet-openbaar gebied gebruikt. Meer informatie over de gevolgde methode vind je in het kaartverhaal via de knop meer info.'
WHERE title = 'Openbaar en niet-openbaar' AND dashboard_config_id = (SELECT id FROM dashboard_configs WHERE slug = 'default-nl');

UPDATE indicators SET tekst_vraagteken = 'Deze statistieken tonen de hoeveelheid groen per inwoner op basis van de basiskaart Groen en Verharding en de CBS Wijk en Buurtkaart 2024.'
WHERE title = 'Groen per inwoner' AND dashboard_config_id = (SELECT id FROM dashboard_configs WHERE slug = 'default-nl');

UPDATE indicators SET tekst_vraagteken = 'Deze statistieken laten het aantal inwoners per km2 zien op basis van de CBS Wijk en Buurtkaart 2022. In buurten met een hoge bevolkingsdichtheid worden veel mensen blootgesteld aan klimaateffecten. Tegelijk is de druk op de buitenruimte daar vaak hoog waardoor er minder ruimte is voor adaptiemaatregelen.'
WHERE title = 'Bevolkingsdichtheid' AND dashboard_config_id = (SELECT id FROM dashboard_configs WHERE slug = 'default-nl');

UPDATE indicators SET tekst_vraagteken = 'Deze statistieken laten de gemiddelde WOZ-waarde per buurt zien op basis van de Wijk- en Buurtkaart 2022 van het CBS. De WOZ-waarde geeft een indicatie van de sociaaleconomische status van een buurt. In buurten met een hoge WOZ-waarde kunnen inwoners meestal makkelijker zelf adaptatiemaatregelen nemen.'
WHERE title = 'Gemiddelde WOZ-waarde' AND dashboard_config_id = (SELECT id FROM dashboard_configs WHERE slug = 'default-nl');

UPDATE indicators SET tekst_vraagteken = 'Deze statistieken laten het percentage huishoudens zien dat leeft rond of onder het sociaal minimum. Deze groep is extra kwetsbaar voor hitte. Wil je meer weten over de relatie tussen sociale kwetsbaarheid en hitte? Ga dan naar het kaartverhaal.'
WHERE title = 'Sociaal minimum huishoudens' AND dashboard_config_id = (SELECT id FROM dashboard_configs WHERE slug = 'default-nl');

UPDATE indicators SET tekst_vraagteken = 'Deze statistieken laten het percentage 65-plussers zien met een broze gezondheid. Deze groep is extra kwetsbaar voor hitte. Het begrip broosheid omvat fysieke gezondheid, mentale gezondheid en sociale gezondheid. Wil je meer weten over de relatie tussen 65-plussers met een broze gezondheid en hitte? Ga dan naar het kaartverhaal.'
WHERE title = 'Hitte en broze 65-plussers' AND dashboard_config_id = (SELECT id FROM dashboard_configs WHERE slug = 'default-nl');

UPDATE indicators SET tekst_vraagteken = 'Deze statistieken tonen het percentage ernstig eenzame mensen boven de 18 jaar. Deze mensen zijn extra kwetsbaar voor hitte omdat ze weinig sociale contacten hebben. Dit vergroot het risico op uitdroging en oververhitting bij een hittegolf. Ga voor meer informatie over deze statistieken naar de Buurtatlas van het RIVM.'
WHERE title = 'Ernstige eenzaamheid' AND dashboard_config_id = (SELECT id FROM dashboard_configs WHERE slug = 'default-nl');

UPDATE indicators SET tekst_vraagteken = 'Deze statistieken tonen het percentage mensen boven de 18 jaar dat in 2020 moeite had met rondkomen. Deze groep heeft minder financiële ruimte om maatregelen te nemen tegen hitte. Ga voor meer informatie over deze statistieken naar de Buurtatlas van het RIVM.'
WHERE title = 'Moeite met rondkomen' AND dashboard_config_id = (SELECT id FROM dashboard_configs WHERE slug = 'default-nl');

UPDATE indicators SET tekst_vraagteken = 'Deze statistieken tonen het percentage mensen boven de 18 jaar met ernstig overgewicht. Deze mensen zijn extra kwetsbaar voor hitte. Dit vergroot het risico op uitdroging en oververhitting bij een hittegolf. Ga voor meer informatie over deze statistieken naar de Buurtatlas van het RIVM.'
WHERE title = 'Ernstig overgewicht' AND dashboard_config_id = (SELECT id FROM dashboard_configs WHERE slug = 'default-nl');

UPDATE indicators SET tekst_vraagteken = 'Deze statistieken tonen hoeveel procent van de woningen bestaat uit huurwoningen. Voor bewoners van huurwoningen is het lastiger om grote aanpassingen te doen aan hun woning. Ze kunnen bijvoorbeeld niet zomaar zonneschermen plaatsen. De statistieken komen van de CBS Wijk- en Buurtkaart 2022.'
WHERE title = 'Percentage huurwoningen' AND dashboard_config_id = (SELECT id FROM dashboard_configs WHERE slug = 'default-nl');

-- =====================================================
-- NOW UPDATE THE PUBLISHED TABLE (this is what the app reads!)
-- =====================================================

UPDATE indicators_published SET tekst_vraagteken = 'Deze percentages laten zien hoe hoog de gevoelstemperatuur in de buitenruimte wordt op een hete, vrijwel windstille zomerdag. Vooral buurten met weinig schaduw en veel verharding warmen sterk op. De lengte van de balkjes wordt bepaald door het aandeel buitenruimte: water en gebouwen worden niet gevuld. Wil je weten waarop deze percentages zijn gebaseerd? Ga dan naar het kaartverhaal.'
WHERE title = 'Gevoelstemperatuur' AND dashboard_config_id = (SELECT id FROM dashboard_configs_published WHERE slug = 'default-nl');

UPDATE indicators_published SET tekst_vraagteken = 'Deze statistieken laten zien welke waterdiepte ontstaat bij een hevige zomerbui. De grafieken tonen het percentage van een gebied per waterdiepteklasse. Gebouwen, oppervlaktewater en gebieden met minder dan 5 cm worden niet getoond met gekleurde balkjes. De statistieken gaan uit van een gelijke rioolbergings- en afvoercapaciteit en van de hoogtekaart van 2012. Dat betekent dat deze informatie niet bruikbaar is voor gebieden die na 2012 zijn ontwikkeld of aangepast. Wil je meer weten over de achtergrond van deze statistieken? Ga dan naar het kaartverhaal.'
WHERE title = 'Waterdiepte bij hevige bui' AND dashboard_config_id = (SELECT id FROM dashboard_configs_published WHERE slug = 'default-nl');

UPDATE indicators_published SET tekst_vraagteken = 'Deze statistieken laten de Gemiddelde Laagste Grondwaterstand (GLG) zien voor het huidige klimaat. De getallen tonen het gemiddelde aantal meters onder het maaiveld per buurt. De GLG is gemodelleerd met het Nationaal Water Model. De kaarten geven een grof beeld en zijn dus alleen bedoeld ter indicatie. Wil je meer informatie over deze statistieken? Ga dan naar het kaartverhaal.'
WHERE title = 'Lage grondwaterstand' AND dashboard_config_id = (SELECT id FROM dashboard_configs_published WHERE slug = 'default-nl');

UPDATE indicators_published SET tekst_vraagteken = 'Deze statistieken laten zien hoe de Gemiddelde Laagste Grondwaterstand (GLG) tussen nu en 2050 verandert bij sterke klimaatverandering. De GLG is gemodelleerd met het Nationaal Water Model. De kaarten geven een grof beeld en zijn dus alleen bedoeld ter indicatie. Wil je meer informatie over deze statistieken? Ga dan naar het kaartverhaal.'
WHERE title = 'Lage grondwaterstand | 2050 hoog' AND dashboard_config_id = (SELECT id FROM dashboard_configs_published WHERE slug = 'default-nl');

UPDATE indicators_published SET tekst_vraagteken = 'Deze statistieken laten de laagste grondwaterstand (LG3) zien voor het huidige klimaat op basis van het extreem droge jaar 1976. De getallen tonen het gemiddelde aantal meters onder het maaiveld per buurt. De LG3 is gemodelleerd met het Nationaal Water Model. De kaarten geven een grof beeld en zijn dus alleen bedoeld ter indicatie. Wil je meer informatie over deze statistieken? Ga dan naar het kaartverhaal.'
WHERE title = 'Extreem lage grondwaterstand ' AND dashboard_config_id = (SELECT id FROM dashboard_configs_published WHERE slug = 'default-nl');

UPDATE indicators_published SET tekst_vraagteken = 'Deze statistieken laten de Gemiddelde Hoogste Grondwaterstand (GHG) zien voor het huidige klimaat. Dit is de maatgevend voor een natte situatie. De getallen tonen het gemiddelde aantal meters onder het maaiveld per buurt. De GHG is gemodelleerd met het Nationaal Water Model. De kaarten geven een grof beeld en zijn dus alleen bedoeld ter indicatie. Wil je meer informatie over deze statistieken? Ga dan naar het kaartverhaal.'
WHERE title = 'Hoge grondwaterstand ' AND dashboard_config_id = (SELECT id FROM dashboard_configs_published WHERE slug = 'default-nl');

UPDATE indicators_published SET tekst_vraagteken = 'Deze statistieken laten de maximale grondwaterstand (zogenaamde HG3) zien bij het huidige klimaat. Dit is de maximale grondwaterstand die over een periode van 100 jaar (1911-2011) gemodelleerd is. Dit is de maatgevende grondwaterstand. De getallen tonen het aantal meters onder het maaiveld. De GHG is gemodelleerd met het Nationaal Water Model. De kaarten geven een grof beeld en zijn dus alleen bedoeld ter indicatie. Wil je meer informatie over deze statistieken? Ga dan naar het kaartverhaal.'
WHERE title = 'Extreem hoge grondwaterstand ' AND dashboard_config_id = (SELECT id FROM dashboard_configs_published WHERE slug = 'default-nl');

UPDATE indicators_published SET tekst_vraagteken = 'Deze statistieken laten de risico''s op paalrot zien in het huidige klimaat. Het risico wordt berekend door het percentage panden met houten palen op een locatie te combineren met de gevoeligheid van die locatie voor paalrot. Wil je meer weten over de achtergrond van deze statistieken? Ga dan naar het kaartverhaal.'
WHERE title = 'Risico Paalrot huidig' AND dashboard_config_id = (SELECT id FROM dashboard_configs_published WHERE slug = 'default-nl');

UPDATE indicators_published SET tekst_vraagteken = 'Deze statistieken laten zien wat in 2050 de risico''s op paalrot zijn als het klimaat sterk verandert. Door veranderingen in grondwaterstanden kan het risico op paalrot veranderen. Het risico wordt berekend door het percentage panden met houten palen op een locatie te combineren met de gevoeligheid van die locatie voor paalrot. Wil je meer weten over de achtergrond van deze statistieken? Ga dan naar het kaartverhaal.'
WHERE title = 'Risico Paalrot 2050 hoog' AND dashboard_config_id = (SELECT id FROM dashboard_configs_published WHERE slug = 'default-nl');

UPDATE indicators_published SET tekst_vraagteken = 'Deze statistieken laten de risico''s zien voor verschilzetting in 2050 bij sterke klimaatverandering. Het risico wordt berekend door het percentage panden op staal op een locatie te combineren met de gevoeligheid van die locatie voor verschilzetting. Wil je meer weten over de achtergrond van deze statistieken? Ga dan naar het kaartverhaal.'
WHERE title = 'Risico Verschilzetting 2050H' AND dashboard_config_id = (SELECT id FROM dashboard_configs_published WHERE slug = 'default-nl');

UPDATE indicators_published SET tekst_vraagteken = 'Deze statistieken laten het percentage schaduw zien op wandel- en fietspaden. De schaduwkaart gaat uit van de schaduw op 21 juni om 15:30 uur, omdat dit de langste dag van het jaar is met de kortste schaduwen. In de Maatlat groene klimaatadaptieve gebouwde omgeving wordt hiervoor een streefwaarde van 30% op buurtniveau genoemd. De fiets- en wandelpaden komen uit de Basiskaart Grootschalige Topografie. Wil je meer informatie over deze statistieken? Ga dan naar het kaartverhaal.'
WHERE title = 'Schaduw wandel- en fietspaden' AND dashboard_config_id = (SELECT id FROM dashboard_configs_published WHERE slug = 'default-nl');

UPDATE indicators_published SET tekst_vraagteken = 'Deze statistieken toont welke waterdiepten kunnen voorkomen bij een overstroming met een extreem kleine kans (1:100.000 jaar). Per diepteklasse verschillen de gevolgen. Ook de mogelijke maatregelen voor gevolgbeperking verschillen per diepteklasse. Wil je meer informatie over deze statistieken? Ga dan naar het kaartverhaal.'
WHERE title = 'Maximale overstromingsdiepte' AND dashboard_config_id = (SELECT id FROM dashboard_configs_published WHERE slug = 'default-nl');

UPDATE indicators_published SET tekst_vraagteken = 'Deze statistieken tonen hoeveel % van de gebouwen in de buurt een droge verdieping heeft bij een overstroming met een extreem kleine kans (1:100.000 jaar). Deze informatie kan interessant zijn bij het verkennen van maatregelen bij een diepe overstroming. Wil je meer informatie over deze statistieken? Ga dan naar het kaartverhaal.'
WHERE title = 'Droge verdiepingen' AND dashboard_config_id = (SELECT id FROM dashboard_configs_published WHERE slug = 'default-nl');

UPDATE indicators_published SET tekst_vraagteken = 'Deze statistieken laten zien wat het totale oppervlakte en percentage boomkroonoppervlakte is per buurt. Voor het bepalen van het boomkroonoppervlakte is gebruik gemaakt van het Actueel Hoogtebestand Nederland als broninformatie. Meer informatie over de gevolgde methode vind je in het kaartverhaal.'
WHERE title = 'Boomkroonoppervlakte' AND dashboard_config_id = (SELECT id FROM dashboard_configs_published WHERE slug = 'default-nl');

UPDATE indicators_published SET tekst_vraagteken = 'Deze statistieken laten zien wat het percentage boomkroonoppervlakte is binnen het openbare gebied. Voor het bepalen van het boomkroonoppervlakte is gebruik gemaakt van het Actueel Hoogtebestand Nederland als broninformatie. Voor het bepalen van het openbare gebied is gebruik gemaakt van informatie uit basisregistraties. Meer informatie over de gevolgde methode vind je in het kaartverhaal.'
WHERE title = 'Boomkroonoppervlakte openbaar' AND dashboard_config_id = (SELECT id FROM dashboard_configs_published WHERE slug = 'default-nl');

UPDATE indicators_published SET tekst_vraagteken = 'Deze statistieken laten zien wat het percentage boomkroonoppervlakte is binnen het niet-openbare gebied. Voor het bepalen van het boomkroonoppervlakte is gebruik gemaakt van het Actueel Hoogtebestand Nederland als broninformatie. Voor het bepalen van het niet-openbare gebied is gebruik gemaakt van informatie uit basisregistraties. Meer informatie over de gevolgde methode vind je in het kaartverhaal.'
WHERE title = 'Boomkroonoppervlakte niet-openbaar ' AND dashboard_config_id = (SELECT id FROM dashboard_configs_published WHERE slug = 'default-nl');

UPDATE indicators_published SET tekst_vraagteken = 'Deze statistieken tonen het percentage groen op basis van de Basiskaart Groen en verharding. Uit de Totaalkaart worden de gebieden met boomkroonbedekking, struiken en onverhard - gras opgeteld en weergeven als percentage van het totale landoppervlakte. Agrarisch gebied is niet als groen meegenomen. De klasse onverhard is ook niet als groen meegenomen, hoewel deze wel groen kan zijn. Meer informatie over de gevolgde methode vind je in het kaartverhaal.'
WHERE title = 'Groen' AND dashboard_config_id = (SELECT id FROM dashboard_configs_published WHERE slug = 'default-nl');

UPDATE indicators_published SET tekst_vraagteken = 'Deze statistieken tonen het percentage groen in het openbaar gebied op basis van de Basiskaart Groen en verharding. Uit de Totaalkaart worden de gebieden met boomkroonbedekking, struiken en onverhard - gras opgeteld. Agrarisch gebied is niet als groen meegenomen. De klasse onverhard is ook niet als groen meegenomen, hoewel deze wel groen kan zijn. Voor het bepalen van het openbare gebied is gebruik gemaakt van informatie uit basisregistraties. Meer informatie over de gevolgde methode vind je in het kaartverhaal via de knop meer info.'
WHERE title = 'Groen openbaar' AND dashboard_config_id = (SELECT id FROM dashboard_configs_published WHERE slug = 'default-nl');

UPDATE indicators_published SET tekst_vraagteken = 'Deze statistieken tonen het percentage groen in niet-openbaar gebied op basis van de Basiskaart Groen en verharding. Uit de Totaalkaart worden de gebieden met boomkroonbedekking, struiken en onverhard - gras opgeteld. Agrarisch gebied is niet als groen meegenomen. De klasse onverhard is ook niet als groen meegenomen, hoewel deze wel groen kan zijn. Voor het bepalen van het niet-openbare gebied is gebruik gemaakt van informatie uit basisregistraties. Meer informatie over de gevolgde methode vind je in het kaartverhaal via de knop meer info.'
WHERE title = 'Groen niet-openbaar' AND dashboard_config_id = (SELECT id FROM dashboard_configs_published WHERE slug = 'default-nl');

UPDATE indicators_published SET tekst_vraagteken = 'Deze statistieken tonen het percentage verharding op basis van de Basiskaart Groen en verharding. Uit de landbedekkingskaart is de klasse verhard gebruikt en weergegeven als percentage van het totale landoppervlakte. Er is enkel gekeken naar de buitenruimte: gebouwen zijn niet als verhard geclassificeerd. Meer informatie over de gevolgde methode vind je in het kaartverhaal via de knop meer info.'
WHERE title = 'Verharding ' AND dashboard_config_id = (SELECT id FROM dashboard_configs_published WHERE slug = 'default-nl');

UPDATE indicators_published SET tekst_vraagteken = 'Deze statistieken tonen het percentage verharding voor het openbare gebied op basis van de Basiskaart Groen en verharding. Uit de landbedekkingskaart is de klasse verhard gebruikt. Er is enkel gekeken naar de buitenruimte: gebouwen zijn niet als verhard geclassificeerd. Voor het bepalen van het openbare gebied is gebruik gemaakt van informatie uit basisregistraties. Meer informatie over de gevolgde methode vind je in het kaartverhaal via de knop meer info.'
WHERE title = 'Verharding openbaar' AND dashboard_config_id = (SELECT id FROM dashboard_configs_published WHERE slug = 'default-nl');

UPDATE indicators_published SET tekst_vraagteken = 'Deze statistieken tonen het percentage verharding voor het niet-openbare gebied op basis van de Basiskaart Groen en verharding. Uit de landbedekkingskaart is de klasse verhard gebruikt. Er is enkel gekeken naar de buitenruimte: gebouwen zijn niet als verhard geclassificeerd. Voor het bepalen van het niet-openbare gebied is gebruik gemaakt van informatie uit basisregistraties. Meer informatie over de gevolgde methode vind je in het kaartverhaal via de knop meer info.'
WHERE title = 'Verharding niet-openbaar' AND dashboard_config_id = (SELECT id FROM dashboard_configs_published WHERE slug = 'default-nl');

UPDATE indicators_published SET tekst_vraagteken = 'De kaart toont het percentage water per buurt op basis van de Basiskaart Verharding en Groen. Uit de landbedekkingskaart is de klasse water gebruikt. Meer informatie over de gevolgde methode vind je in het kaartverhaal via de knop meer info.'
WHERE title = 'Water' AND dashboard_config_id = (SELECT id FROM dashboard_configs_published WHERE slug = 'default-nl');

UPDATE indicators_published SET tekst_vraagteken = 'De statistieken tonen de verdeling van de landbedekking op basis van de Basiskaart Groen en verharding. Uit de Totaalkaart worden de klassen onverhard, onverhard - gras, onverhard - struiken, halfverhard, verhard en gebouwen getoond als percentage van het totale landoppervlakte. Meer informatie over de gevolgde methode vind je in het kaartverhaal.'
WHERE title = 'Landbedekking ' AND dashboard_config_id = (SELECT id FROM dashboard_configs_published WHERE slug = 'default-nl');

UPDATE indicators_published SET tekst_vraagteken = 'De statistieken tonen de verdeling tussen openbaar gebied, niet-openbaar gebied en gebouwen op basis van de Basiskaart Groen en Verharding. Hiervoor wordt de kaart openbaar gebied en niet-openbaar gebied gebruikt. Meer informatie over de gevolgde methode vind je in het kaartverhaal via de knop meer info.'
WHERE title = 'Openbaar en niet-openbaar' AND dashboard_config_id = (SELECT id FROM dashboard_configs_published WHERE slug = 'default-nl');

UPDATE indicators_published SET tekst_vraagteken = 'Deze statistieken tonen de hoeveelheid groen per inwoner op basis van de basiskaart Groen en Verharding en de CBS Wijk en Buurtkaart 2024.'
WHERE title = 'Groen per inwoner' AND dashboard_config_id = (SELECT id FROM dashboard_configs_published WHERE slug = 'default-nl');

UPDATE indicators_published SET tekst_vraagteken = 'Deze statistieken laten het aantal inwoners per km2 zien op basis van de CBS Wijk en Buurtkaart 2022. In buurten met een hoge bevolkingsdichtheid worden veel mensen blootgesteld aan klimaateffecten. Tegelijk is de druk op de buitenruimte daar vaak hoog waardoor er minder ruimte is voor adaptiemaatregelen.'
WHERE title = 'Bevolkingsdichtheid' AND dashboard_config_id = (SELECT id FROM dashboard_configs_published WHERE slug = 'default-nl');

UPDATE indicators_published SET tekst_vraagteken = 'Deze statistieken laten de gemiddelde WOZ-waarde per buurt zien op basis van de Wijk- en Buurtkaart 2022 van het CBS. De WOZ-waarde geeft een indicatie van de sociaaleconomische status van een buurt. In buurten met een hoge WOZ-waarde kunnen inwoners meestal makkelijker zelf adaptatiemaatregelen nemen.'
WHERE title = 'Gemiddelde WOZ-waarde' AND dashboard_config_id = (SELECT id FROM dashboard_configs_published WHERE slug = 'default-nl');

UPDATE indicators_published SET tekst_vraagteken = 'Deze statistieken laten het percentage huishoudens zien dat leeft rond of onder het sociaal minimum. Deze groep is extra kwetsbaar voor hitte. Wil je meer weten over de relatie tussen sociale kwetsbaarheid en hitte? Ga dan naar het kaartverhaal.'
WHERE title = 'Sociaal minimum huishoudens' AND dashboard_config_id = (SELECT id FROM dashboard_configs_published WHERE slug = 'default-nl');

UPDATE indicators_published SET tekst_vraagteken = 'Deze statistieken laten het percentage 65-plussers zien met een broze gezondheid. Deze groep is extra kwetsbaar voor hitte. Het begrip broosheid omvat fysieke gezondheid, mentale gezondheid en sociale gezondheid. Wil je meer weten over de relatie tussen 65-plussers met een broze gezondheid en hitte? Ga dan naar het kaartverhaal.'
WHERE title = 'Hitte en broze 65-plussers' AND dashboard_config_id = (SELECT id FROM dashboard_configs_published WHERE slug = 'default-nl');

UPDATE indicators_published SET tekst_vraagteken = 'Deze statistieken tonen het percentage ernstig eenzame mensen boven de 18 jaar. Deze mensen zijn extra kwetsbaar voor hitte omdat ze weinig sociale contacten hebben. Dit vergroot het risico op uitdroging en oververhitting bij een hittegolf. Ga voor meer informatie over deze statistieken naar de Buurtatlas van het RIVM.'
WHERE title = 'Ernstige eenzaamheid' AND dashboard_config_id = (SELECT id FROM dashboard_configs_published WHERE slug = 'default-nl');

UPDATE indicators_published SET tekst_vraagteken = 'Deze statistieken tonen het percentage mensen boven de 18 jaar dat in 2020 moeite had met rondkomen. Deze groep heeft minder financiële ruimte om maatregelen te nemen tegen hitte. Ga voor meer informatie over deze statistieken naar de Buurtatlas van het RIVM.'
WHERE title = 'Moeite met rondkomen' AND dashboard_config_id = (SELECT id FROM dashboard_configs_published WHERE slug = 'default-nl');

UPDATE indicators_published SET tekst_vraagteken = 'Deze statistieken tonen het percentage mensen boven de 18 jaar met ernstig overgewicht. Deze mensen zijn extra kwetsbaar voor hitte. Dit vergroot het risico op uitdroging en oververhitting bij een hittegolf. Ga voor meer informatie over deze statistieken naar de Buurtatlas van het RIVM.'
WHERE title = 'Ernstig overgewicht' AND dashboard_config_id = (SELECT id FROM dashboard_configs_published WHERE slug = 'default-nl');

UPDATE indicators_published SET tekst_vraagteken = 'Deze statistieken tonen hoeveel procent van de woningen bestaat uit huurwoningen. Voor bewoners van huurwoningen is het lastiger om grote aanpassingen te doen aan hun woning. Ze kunnen bijvoorbeeld niet zomaar zonneschermen plaatsen. De statistieken komen van de CBS Wijk- en Buurtkaart 2022.'
WHERE title = 'Percentage huurwoningen' AND dashboard_config_id = (SELECT id FROM dashboard_configs_published WHERE slug = 'default-nl');
