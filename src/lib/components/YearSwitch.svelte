<script>
  import { indicatorYearChanged, jaarSelecties } from "$lib/stores";
    import { selectAll } from "d3";

  export let indicator

  let selectedYear = '2023'

  const rectWidth = 60
  const rectHeight = 30
  const spaceBetween = 20

  function yearClick(year){
    yearMouseOut()
    selectedYear = year

    $jaarSelecties[indicator.title] = year
    jaarSelecties.set($jaarSelecties)

    indicatorYearChanged.set([indicator.title, year])
  }

  function yearMouseOver(year){
    if(year !== selectedYear){
      selectAll('.hoveryear_' + indicator.title.replaceAll(' ', ''))
        .style('visibility', 'visible')
    }
  }

  function yearMouseOut(){
    selectAll('.hoveryear_'+ indicator.title.replaceAll(' ', ''))
      .style('visibility', 'hidden')
  }

</script>

<svg>
  <g transform='translate(0,12)' font-size='18'>
    <rect class={(selectedYear === '2019') ? '' : 'passive'} stroke='lightgrey' stroke-width='2' width={rectWidth} height={rectHeight} rx='12' fill={(selectedYear === '2019') ? '#36575B' : 'lightgrey'}
    on:click={() => {yearClick('2019')}}
    on:mouseover={() => {yearMouseOver('2019')}}
    on:mouseout={() => {yearMouseOut('2019')}}/>
    <text x={11} y={rectHeight/2 + 6} fill={(selectedYear === '2019') ? 'white' : 'grey'}>2019</text>

    <rect class={(selectedYear === '2023') ? '' : 'passive'} stroke='lightgrey' stroke-width='2' x={rectWidth+spaceBetween} width={rectWidth} height={rectHeight} rx='12' fill={(selectedYear === '2023') ? '#36575B' : 'lightgrey'}
    on:click={() => {yearClick('2023')}}
    on:mouseover={() => {yearMouseOver('2023')}}
    on:mouseout={() => {yearMouseOut('2023')}}/>
    <text x={rectWidth + spaceBetween + 11} y={rectHeight/2 + 5} fill={(selectedYear === '2023') ? 'white' : 'grey'}>2023</text>
  </g>
</svg>

<style>
  svg{
    width:140px;
  }
  text{
    pointer-events: none;
  }
  rect{
    cursor:pointer;
    transition: all 0.5s;
  }

  .passive:hover{
    fill: #ededed;
  }



</style>