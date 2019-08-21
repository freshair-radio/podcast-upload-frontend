<template>
	<div class="login">
		<div class="card">
			<h1 v-if="state == PRE || state == LOADING">Welcome!</h1>
			<h1 v-if="state == VERIFY || state == CHECKING">
				{{ error || "Enter code" }}
			</h1>
			<input
				type="text"
				v-model="number"
				:disabled="
					state == LOADING || state == VERIFY || state == CHECKING
				"
				placeholder="+447770100100"
			/>
			<input
				v-if="state == VERIFY || state == CHECKING"
				type="text"
				v-model="code"
				placeholder="123456"
			/>

			<button v-if="state == PRE" @click="get_code">
				Continue →
			</button>
			<div
				class="loader"
				v-if="state == LOADING || state == CHECKING"
			></div>
			<button v-if="state == VERIFY" @click="check_code">
				Continue →
			</button>
		</div>
	</div>
</template>

<script lang="ts">
import Vue from "vue";
const PRE = Symbol();
const LOADING = Symbol();
const VERIFY = Symbol();
const CHECKING = Symbol();
export default Vue.extend({
	name: "login",
	data() {
		return {
			PRE,
			LOADING,
			VERIFY,
			CHECKING,
			number: "",
			code: "",
			state: PRE,
			title: ""
		};
	},
	methods: {
		get_code() {
			fetch("https://auth.freshair.workers.dev", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					action: "request",
					payload: {
						number: this.number
					}
				})
			})
				.then(r => r.json())
				.then(r => {
					this.number = r.international_number;
					this.state = VERIFY;
				});
			this.state = LOADING;
		},
		check_code() {
			fetch("https://auth.freshair.workers.dev", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					action: "verify",
					payload: {
						international_number: this.number,
						verification: this.code
					}
				})
			})
				.then(r => r.json())
				.then(r => {
					this.$root.$data.user = JSON.parse(r.user);
					this.$root.$data.auth = r.token;
					if (this.$root.$data.user.name) {
						this.$router.push("/admin");
					} else {
						this.$router.push("/setup");
					}
				});
			this.state = CHECKING;
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
