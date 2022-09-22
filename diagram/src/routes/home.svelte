<script lang="ts">
import { onMount } from "svelte";
    let width = 10;
    let height = 9;
    let length = 5;
    onMount(() => {
        let room = document.getElementById("room");
        room.style.width = `${width*30}px`;
        room.style.height = `${length*30}px`;
    })
</script>
<div style="margin: 20px">
    Width: <input type="number" bind:value={width} on:change={() => {
        document.getElementById("room").style.width = `${width*30}px`;
    }} />ft
    <br />
    Length: <input type="number" bind:value={length} />ft
    <br />
    Height: <input type="number" bind:value={height} on:change={() => {
        document.getElementById("room").style.height = `${height*30}px`;
    }} />ft
    <div id="room" style="border: 1px solid black; margin: 25px">
    </div>
    <a href={`/diagram?width=${width}&length=${length}&height=${height}`}><button>Get to Wirin'</button></a>
</div>
