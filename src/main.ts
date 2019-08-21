import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  data() {
    return {
      user: {},
      auth: ""
    };
  },
  render: h => h(App)
}).$mount("#app");
