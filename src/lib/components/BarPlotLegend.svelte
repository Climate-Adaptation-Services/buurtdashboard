<script>

  export let color
  export let w;

  // const padding3 = 90
  // const padding2 = 120
  // $: innerwidth3 = (w - 2*padding3) / 3
  // $: innerwidth2 = (w - 2*padding2) / 2

  const margin = {top:30, bottom:30, left:30, right:30}
  $: legendElementWidth = (w-margin.left-margin.right) / 3

  const klasseNamen = ['Zeer laag', 'Laag', 'Midden', 'Hoog', 'Zeer hoog']

</script>

<div class='barplot-legend' style='width:{w-margin.left-margin.right}px; margin-left:{margin.left}px; margin-top:{margin.top}px'>
  {#each klasseNamen as klasse,i}
    <div class='legend-element' style='width:{legendElementWidth}px'>
      <svg>
        <g>
          <rect x={0} y={0} width={12} height={12} fill={color(klasse)}></rect>
          <text dx='20px' dy='0.74em'>{klasse}</text>
        </g>
      </svg>
    </div>
  {/each}
</div>


<style>
  svg{
    width:100%;
    height:100%;
  }

  .barplot-legend{
    width:100%;
    /* display: flex; */
    /* flex-direction: column; */
    /* margin-left:50px;
    margin-right:50px; */
  }

  .legend-element{
    float: left;
    height:30px;
    width:33%;
  }

</style>