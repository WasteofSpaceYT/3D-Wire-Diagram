<script lang="ts">
import { Router, Link, Route } from "svelte-routing";
import Diagram from "./routes/diagram.svelte";
import Home from "./routes/home.svelte";
import Menu from "./routes/menu.svelte";
let isSubmitted = false;
</script>
<div>
	<Menu />
	<Router>
		<Route path="/diagram" component={Diagram} />
		<Route path="/">
	<Home />
		</Route>
	</Router>
</div>