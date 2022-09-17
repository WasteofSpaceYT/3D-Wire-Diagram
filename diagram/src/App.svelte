<script lang="ts">
import { Router, Link, Route } from "svelte-routing";
import Diagram from "./routes/diagram.svelte";
import Home from "./routes/home.svelte";
let isSubmitted = false;
let url = "";
</script>
<div>
	<Router url={url}>
		<h1>{url}</h1>
		<Route path="/diagram" component={Diagram} />
		<Route path="/">
	<Home />
		</Route>
	</Router>
</div>