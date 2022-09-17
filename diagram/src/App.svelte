<script lang="ts">
import { Router, Link, Route } from "svelte-routing";
import Diagram from "./routes/diagram.svelte";
import Home from "./routes/home.svelte";
let isSubmitted = false;
let url = "";
</script>
<div>
	<Router bind:url={url}>
		<Route path="/diagram"><Diagram url={url} /></Route>
		<Route path="/">
	<Home />
		</Route>
	</Router>
</div>