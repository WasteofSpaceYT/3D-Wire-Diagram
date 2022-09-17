<script lang="ts">
import { Router, Link, Route } from "svelte-routing";
import Diagram from "./routes/diagram.svelte";
import Home from "./routes/home.svelte";
let isSubmitted = false;
</script>
<div>
	<Router>
		<Route path="/diagram" component={Diagram} />
		<Route path="/">
	<Home />
		</Route>
	</Router>
</div>