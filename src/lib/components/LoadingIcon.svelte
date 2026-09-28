<script>
  import {
    Circle,
    Circle2,
    Circle3,
    DoubleBounce,
    GoogleSpin,
    ScaleOut,
    SpinLine,
    Stretch,
    BarLoader,
    Jumper,
    RingLoader,
    SyncLoader,
    Rainbow,
    Wave,
    Firework,
    Pulse,
    Jellyfish,
    Chasing,
    Shadow,
    Square,
    Moon,
    Plane,
    Diamonds,
    Clock,
  } from "svelte-loading-spinners"

  let color = "#FF3E00"
  let size = "60"
  let unit = "px"
</script>

<div class="spinner-item" title="Kaart">
  <Circle2 {size} {color} />
  <div class="spinner-title" style="color:white">Buurtdashboard laden...</div>
</div>

<style>

  .spinner-item {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    visibility: visible;
    z-index: 1000;
    top: 0px;
    /* background: rgba(360, 360, 360, 0.45); */
    /* box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06); */
  }
  .spinner-title {
    position: absolute;
    bottom: 100px;
  }
</style>
