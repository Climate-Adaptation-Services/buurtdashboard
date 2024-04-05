<!-- <script>
  import OpenAI from "openai";
  import { select, easeLinear } from "d3";
  import { buurtSelectionData } from "$lib/stores";

  const openai = new OpenAI({apiKey:'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', dangerouslyAllowBrowser: true});

  let imageURL = '';
  async function createDallEImage() {
    const sizeOfHouse = ($buurtSelectionData.properties['G_WOZ'] > 550)
      ? 'large'
      : ($buurtSelectionData.properties['G_WOZ'] > 400)
        ? 'average'
        : 'small'
    
    const wealth = ($buurtSelectionData.properties['G_WOZ'] > 550)
      ? 'rich'
      : ($buurtSelectionData.properties['G_WOZ'] > 400)
        ? 'average'
        : 'poor'

    // const rijtjeshuis = ($buurtSelectionData.properties['G_WOZ'] > 550)
    //   ? 'detached house'
    //   : 'attached house'
    
    const stadLand = ($buurtSelectionData.properties['BEV_DICHTH'] < 50)
      ? 'the countryside'
      : 'a city'

    const familie = ($buurtSelectionData.properties['ErnstigZee'] < 5)
      ? 'realistic happy old Dutch man'
      : 'realistic Dutch family with two kids'
    
    const baby = ($buurtSelectionData.properties['Geboorte'] > 1)
      ? ' and a baby'
      : ''

    const boom = ($buurtSelectionData.properties['openbBoom'] > 20)
      ? 'lots of trees'
      : 'pavement'
    
    const gras = ($buurtSelectionData.properties['openbGroen'] > 10)
      ? 'lots of grass'
      : 'roads'

    const water = ($buurtSelectionData.properties['Water'] > 10)
      ? ' and a small river'
      : ''

    const overgewicht = ($buurtSelectionData.properties['ErnsOverge'] > 15)
      ? 'slightly overweight '
      : ''

    const gemeenteNaam = $buurtSelectionData.properties['GM_NAAM']

    const prompt = `
      ${sizeOfHouse} size street in ${stadLand} in a neighbourhood in the municipality of ${gemeenteNaam} in the Netherlands, 
      ${boom} and ${gras}${water} in the environment,
      ${wealth} neighbourhood, 
      ${overgewicht}${familie}${baby} looking at you from a distance, 
      realistic faces
    `

    console.log(prompt)
    
    await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
    }).then((response) => {
      console.log(response.data[0]['url'])
      imageURL = response.data[0]['url'];
      window.open(imageURL, '_blank');
      rotating = false;
    }).catch((error) => {
      console.log(error);
    });

  }

  let rotating = false;
  let rotation = 0
  function rotateImage(){
    if(rotating){
      rotation += 90
      select('.dalle-image')
      .transition('rotate').ease(easeLinear).duration(500)
        .style('transform', `rotate(${rotation}deg)`)
        .on('end', () => {
          rotateImage();
        });
    }else{
      select('.dalle-image').style('transform', `rotate(0deg)`)
    }
  }

</script>

<div class='AI-impression'>
  <img class='dalle-image' src='/ai.png' width='30px' on:click={() => {
    rotating = true;
    rotateImage()
    createDallEImage()
  }}/>
  <p class='download-and-about-text' style='color:white'>AI Impression</p>
</div>

<style>
    .AI-impression{
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    cursor:pointer;
    margin-top:20px;
  }

  .download-and-about-text{
    visibility: hidden;
    margin-top: 5px;
    margin-bottom: 0px;
  }

  .AI-impression:hover .download-and-about-text{
    visibility: visible; 
  }
</style>
 -->
