<script>

  export let color
  export let w;

  const padding3 = 90
  const padding2 = 120
  $: innerwidth3 = (w - 2*padding3) / 3
  $: innerwidth2 = (w - 2*padding2) / 2

  const klasseNamen = ['Zeer laag', 'Laag', 'Midden', 'Hoog', 'Zeer hoog']

</script>

<svg>
  <g class='barplot-legend'>
    {#each klasseNamen as klasse,i}
      <g transform='translate(
        {(i>2) ? (i-3)*innerwidth2+padding2 : i*innerwidth3+padding3},
        {(i>2) ? 80 : 40})'>
        <rect x={0} y={0} width={12} height={12} fill={color(klasse)}></rect>
        <text dx='17px' dy='0.7em'>{klasse}</text>
      </g>
    {/each}
  </g>
</svg>


<style>
  svg{
    width:100%;
  }

</style>