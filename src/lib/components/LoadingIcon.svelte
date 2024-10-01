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
    Clock
  } from "svelte-loading-spinners";

  let color = "#FF3E00";
  let size = "60";
  let unit = "px";

</script>


<div class="spinner-item" title="Kaart">
  <Circle2 {size} {color} />
  <div class="spinner-title" style='color:white'>Buurtdashboard laden...</div>
</div>


<style>
  .header {
    /* margin-top: 50px; */
    display: flex;
    flex-direction: column;
  }
  h1 {
    color: #ff3e00;
    font-size: 48px;
    font-weight: 400;
    margin-top: 0;
    margin-bottom: 10px;
    text-align: center;
  }

  .spinner-item {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    visibility:visible;
    z-index: 1000;
    top:0px;
    /* background: rgba(360, 360, 360, 0.45); */
    /* box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06); */
  }
  .spinner-title {
    position: absolute;
    bottom: 100px;
  }
  .btn {
    margin-top: 20px;
    padding: 10px 30px;
    border-radius: 30px;
    display: block;
    margin: 0 auto;
    color: #fff;
    background-color: rgba(255, 62, 0, 1);
    transition: all 0.15s ease;
    box-sizing: border-box;
    text-transform: uppercase;
    text-decoration: none;
  }
  .btn:hover {
    background-color: rgba(255, 62, 0, 0.8);
  }
  input[type="color"] {
    display: none;
  }
  .color-value {
    display: block;
    margin-bottom: 10px;
  }
  .color-picker {
    position: sticky;
    margin-left: 35px;
    top: 50px;
    display: inline-block;
    z-index: 1;
  }
</style>
