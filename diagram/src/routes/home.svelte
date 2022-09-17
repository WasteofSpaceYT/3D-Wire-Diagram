<script lang="ts">
import { onMount } from "svelte";
    let width = 10;
    let height = 5;
    onMount(() => {
        let room = document.getElementById("room");
        room.style.width = `${width*30}px`;
        room.style.height = `${height*30}px`;
    })
</script>
<div style="margin:20px">
    Height: <input type="number" bind:value={width} on:change={() => {
        document.getElementById("room").style.width = `${width}px`;
    }} />ft
    <br />
    Width: <input type="number" bind:value={height} on:change={() => {
        document.getElementById("room").style.height = `${height}px`;
    }} />ft
    <div id="room" style="border: 1px solid black; margin: 25px">
    </div>
    <button href={`/diagram?width=${width}&height=${height}`}>Get to Wirin'</button>
</div>