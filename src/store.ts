import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
	state: {
		articles: [],
		articles_loading: false,
		user: {},
		user_loading: false,
		article_in_focus: undefined
	},
	mutations: {
		load_articles(state) {
			state.articles_loading = true;
		},
		load_user(state) {
			state.user_loading = true;
		},
		set_articles(state, payload) {
			state.articles_loading = false;
			state.articles = payload.articles;
		},
		set_article_in_focus(state, payload) {
			state.article_in_focus = payload.id;
		},
		set_user(state, payload) {
			state.user_loading = false;
			state.user = payload.user;
		}
	},
	actions: {
		async load_articles({ commit, state }) {
			commit("load_articles");
			const articles = await fetch("https://auth.freshair.workers.dev", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					auth: state.user.auth,
					action: "list"
				})
			}).then(r => r.json());
			commit("set_articles", { articles });
		}
	}
});
