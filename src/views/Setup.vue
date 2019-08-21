<template>
	<div class="login">
		<div class="card">
			<h1 v-if="state == PRE || state == LOADING">What's your name?</h1>

			<input type="text" v-model="name" placeholder="Jane Doe" />

			<button v-if="state == PRE" @click="set_name">
				Continue →
			</button>
			<div class="loader" v-if="state == LOADING"></div>
		</div>
	</div>
</template>

<script lang="ts">
import Vue from "vue";
const PRE = Symbol();
const LOADING = Symbol();

export default Vue.extend({
	name: "login",
	data() {
		return {
			PRE,
			LOADING,

			name: "",
			state: PRE
		};
	},
	methods: {
		set_name() {
			fetch("https://auth.freshair.workers.dev", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					action: "update",
					auth: this.$root.$data.auth,
					payload: {
						name: this.name
					}
				})
			})
				.then(r => r.json())
				.then(r => {
					this.$root.$data.user.name = r.name;
					this.$router.push("/admin");
				});
			this.state = LOADING;
		}
	}
});
</script>
<style scoped>
.card {
	display: inline-block;
	background: #eee;
	border-radius: 20px;
	margin-top: 150px;
	width: 400px;
	padding: 40px;
}
.card h1 {
	margin: 0px;
	margin-bottom: 0px;
}
input {
	background: rgba(255, 148, 33, 0.5);
	text-align: center;
	color: white;
	font-family: "Avenir", Helvetica, Arial, sans-serif;
	font-size: 21px;
	padding: 8px;
	margin-top: 20px;
	border: none;
	width: calc(100% - 40px);
	border-radius: 10px;
}
input[disabled] {
	background: #eee;
	color: rgba(255, 148, 33, 1);
}
button {
	background: rgba(255, 148, 33, 1);
	text-align: center;
	color: white;
	font-family: "Avenir", Helvetica, Arial, sans-serif;
	font-size: 21px;
	padding: 8px;
	border: none;
	margin-top: 20px;
	width: calc(100% - 24px);
	border-radius: 10px;
	cursor: pointer;
}

@keyframes spinner {
	to {
		transform: rotate(360deg);
	}
}

.loader {
	width: 30px;
	height: 30px;
	margin-top: 20px;
	margin-left: calc(50% - 20px);
	border-radius: 50%;
	border: 5px dotted rgba(255, 148, 33, 1);
	animation: spinner 2s linear infinite;
}
</style>
