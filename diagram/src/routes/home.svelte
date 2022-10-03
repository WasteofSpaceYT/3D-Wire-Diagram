<script lang="ts">
import { onMount } from "svelte";
    let width = 10;
    let height = 9;
    let length = 5;
    let floorMat;
    onMount(() => {
        let room = document.getElementById("room");
        room.style.width = `${width*30}px`;
        room.style.height = `${length*30}px`;
    })
    const submit = (e) => {
        const formDat = new FormData(e.target);
        floorMat = formDat.get("floor")
        location.href = `/diagram?width=${width}&length=${length}&height=${height}&floor=${floorMat}`
    }
</script>
<div style="margin: 20px">
    Width: <input type="number" bind:value={width} on:change={() => {
        document.getElementById("room").style.width = `${width*30}px`;
    }} />ft
    <br />
    Length: <input type="number" bind:value={length} on:change={() => {
        document.getElementById("room").style.height = `${length*30}px`;
    }} />ft
    <br />
    Height: <input type="number" bind:value={height} />ft
    <div id="room" style="border: 1px solid black; margin: 25px" />
    <form on:submit|preventDefault={submit}>
    <table>
        <tr>Wood: 
        <td><input type="radio" name="floor" value="wood1" checked><label><img src="/wood1.jpg" alt="" width=50 height = 50></label></td>
        <td><input type="radio" name="floor" value="wood2"><label><img src="/wood2.jpg" alt="" width=50 height = 50></label></td>
        <td><input type="radio" name="floor" value="wood3"><label><img src="/wood3.jpg" alt="" width=50 height = 50></label></td>
        </tr>
        <tr>Tile: 
            <td><input type="radio" name="floor" value="tile1"><label><img src="/tile1.jpg" alt="" width=50 height = 50></label></td>
        <td><input type="radio" name="floor" value="tile2"><label><img src="/tile2.jpg" alt="" width=50 height = 50></label></td>
        <td><input type="radio" name="floor" value="tile3"><label><img src="/tile3.jpg" alt="" width=50 height = 50></label></td>
        </tr>
        <tr>Carpet: 
            <td><input type="radio" name="floor" value="carpet1"><label><img src="/carpet1.jpg" alt="" width=50 height = 50></label></td>
        <td><input type="radio" name="floor" value="carpet2"><label><img src="/carpet2.jpg" alt="" width=50 height = 50></label></td>
        <td><input type="radio" name="floor" value="carpet3"><label><img src="/carpet3.jpg" alt="" width=50 height = 50></label></td>
        </tr>
    </table>
    <button type="submit">Get to Wirin'</button>
    </form>
</div>
