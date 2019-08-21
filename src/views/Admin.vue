<template>
	<div class="login">
		<div class="card">
			<template v-if="state == EDITING || state == UPLOADING">
				<button
					class="save"
					@click="save_article"
					v-if="state == EDITING"
				>
					Save
				</button>
				<div class="loader" v-if="state == UPLOADING"></div>
				<p class="loader-message" v-if="state == UPLOADING">
					Uploading file: this could take a few minutes
				</p>
				<vue-editor
					ref="editor"
					:disabled="state == UPLOADING"
					useCustomImageHandler
					@imageAdded="handleImageAdded"
					:editorOptions="{ theme: 'bubble' }"
					v-model="current_content"
					:editor-toolbar="[
						[{ header: 1 }, { header: 2 }],
						['bold', 'italic', 'underline'],
						[{ list: 'ordered' }, { list: 'bullet' }],
						['image']
					]"
				></vue-editor
			></template>
			<template v-else>
				<h1 v-if="state == PRE">
					{{ articles.length ? "Your articles" : "No articles" }}
				</h1>
				<div
					v-if="state == PRE"
					v-for="(a, i) in arts"
					class="article"
					@click="() => edit(a.id, a.content)"
				>
					<img
						:src="
							a.hero ||
								'https://freshair.nyc3.cdn.digitaloceanspaces.com/resources/white-simple.png'
						"
					/>
					<h1>{{ a.title }}</h1>
					<p>{{ a.short }}</p>
				</div>

				<button v-if="state == PRE" @click="new_article">
					{{
						articles.length
							? "Write an article →"
							: "Write your first! →"
					}}
				</button>
				<div class="loader" v-if="state == LOADING"></div>
			</template>
		</div>
	</div>
</template>

<script lang="ts">
import Vue from "vue";
import { VueEditor, Quill } from "vue2-editor";
let icons = Quill.import("ui/icons");
icons["image"] = icons["link"];
let BlockEmbed = Quill.import("blots/block/embed");

class AudioBlot extends BlockEmbed {
	static create(value) {
		let node = super.create();
		console.log("Creating", value);
		node.setAttribute("controls", true);
		node.setAttribute("src", value);
		return node;
	}

	static value(node) {
		return {
			url: node.getAttribute("src")
		};
	}
}
AudioBlot.blotName = "audio";
AudioBlot.tagName = "audio";

Quill.register(AudioBlot);
const PRE = Symbol();
const LOADING = Symbol();
const EDITING = Symbol();
const UPLOADING = Symbol();
export default Vue.extend({
	name: "login",
	data() {
		return {
			PRE,
			LOADING,
			EDITING,
			UPLOADING,
			articles: [],
			state: LOADING,
			current_id: "",
			current_content: "<h1>The title</h1><p>Some content</p>"
		};
	},
	mounted() {
		this.get_articles();
	},
	methods: {
		get_articles() {
			fetch("https://auth.freshair.workers.dev", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					auth: this.$root.$data.auth,
					action: "list"
				})
			})
				.then(r => r.json())
				.then(r => {
					this.articles = r;
					this.state = PRE;
				});
			this.state = LOADING;
		},
		save_article() {
			const quill = this.$refs.editor.quill;
			let title = quill.container.querySelector("h1")
				? quill.container.querySelector("h1").innerText
				: "";
			let hero = quill.container.querySelector("img")
				? quill.container.querySelector("img").src
				: "";
			let short = title.length
				? quill
						.getText()
						.split(" ")
						.slice(0, 10)
						.join(" ")
						.split(title)
						.slice(1)
						.join(title)
				: quill
						.getText()
						.split(" ")
						.slice(0, 10)
						.join(" ");
			fetch("https://auth.freshair.workers.dev", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					auth: this.$root.$data.auth,
					action: "write",
					payload: {
						at: Date.now(),
						id: this.current_id,
						short,
						title,
						hero,
						byline: this.$root.$data.user.name,
						content: this.current_content
					}
				})
			})
				.then(r => r.json())
				.then(r => {
					this.articles = r;
					this.state = PRE;
				});
			this.state = LOADING;
		},
		new_article() {
			this.state = EDITING;
		},
		edit(id, content) {
			this.current_id = id;
			this.current_content = content;
			this.state = EDITING;
		},
		embed() {
			const quill = this.$refs.editor.quill;
			quill.theme.tooltip.edit();
			quill.theme.tooltip.show();
		},
		handleImageAdded: async function(
			file,
			Editor,
			cursorLocation,
			resetUploader
		) {
			// An example of using FormData
			// NOTE: Your key could be different such as:
			// formData.append('file', file)
			this.state = UPLOADING;
			const cf = await fetch("https://auth.freshair.workers.dev", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					auth: this.$root.$data.auth,
					action: "presigned"
				})
			}).then(r => r.json());
			// var formData = new FormData();
			// formData.append("image", file);
			let data = new Blob([file], { type: "application/octet-stream" });
			console.log(file.type);
			fetch(cf.signed, {
				method: "PUT",
				headers: {
					"Content-Type": "application/octet-stream",
					"x-amz-acl": "public-read"
				},
				body: data
			})
				.then(result => {
					if (file.type == "audio/mpeg") {
						Editor.insertEmbed(cursorLocation, "audio", cf.access);
					} else {
						Editor.insertEmbed(cursorLocation, "image", cf.access);
					}
					this.state = EDITING;
					resetUploader();
				})
				.catch(err => {
					console.log(err);
				});
		}
	},
	computed: {
		arts() {
			return this.articles.map(a => JSON.parse(a));
		}
	},
	components: {
		VueEditor
	}
});
</script>
<style scoped>
.card {
	display: inline-block;
	background: #eee;
	border-radius: 20px;
	margin-top: 150px;
	margin-bottom: 150px;
	width: 700px;
	padding: 40px;
	position: relative;
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
	width: calc(50% - 24px);
	border-radius: 10px;
	cursor: pointer;
}
.save {
	margin: 0px;
	position: absolute;
	border-radius: 10px;
	top: 10px;
	right: 10px;
	width: 150px;
}
.embed {
	margin: 0px;
	position: absolute;
	border-radius: 10px;
	top: 10px;
	right: 170px;
	width: 150px;
}
h2 {
	text-align: left;
}

@keyframes spinner {
	to {
		transform: rotate(360deg);
	}
}

.loader {
	width: 30px;
	height: 30px;
	margin-left: calc(50% - 20px);
	border-radius: 50%;
	border: 5px dotted rgba(255, 148, 33, 1);
	animation: spinner 2s linear infinite;
}
.article {
	background: #ddd;
	border-radius: 20px;
	padding: 10px;
	margin: 10px;
	text-align: left;
	display: grid;
	grid-template-columns: 100px auto;
	grid-template-rows: auto auto;
}
.article h1 {
	grid-column: 2;
	grid-row: 1;
}
.article p {
	margin-top: 0px;
	margin-bottom: 0px;
	grid-column: 2;
	grid-row: 2;
}
.article img {
	grid-column: 1;
	grid-row: 1/3;
	object-fit: cover;
	height: 90px;
	width: 90px;
	border-radius: 10px;
}
</style>
<style>
.ql-editor audio {
	width: 100%;
	border-radius: 6px;
}
</style>
