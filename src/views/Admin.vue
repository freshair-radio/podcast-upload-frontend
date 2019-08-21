<template>
  <div class="login">
    <div class="card">
      <div class="loader" v-if="state == UPLOADING"></div>
      <p
        class="loader-message"
        v-if="state == UPLOADING"
      >Uploading file: this could take a few minutes</p>
      <div v-if="state == PRE">
        <button>
          <label for="podcast">Upload a podcast</label>
        </button>

        <input
          @change="handle_upload"
          style="width:0px;height:0px;padding:0px;margin:0px;opacity:0"
          type="file"
          id="podcast"
          name="podcast"
          accept="audio/mpeg"
        />
      </div>
      <div v-if="state == POST">
        <p>Embed this snippet in your post</p>

        <pre><code>{{api_response}}</code></pre>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

const PRE = Symbol();
const LOADING = Symbol();
const POST = Symbol();
const UPLOADING = Symbol();
export default Vue.extend({
  name: "login",
  data() {
    return {
      PRE,
      LOADING,
      POST,
      UPLOADING,
      state: PRE,
      api_response: ""
    };
  },

  methods: {
    handle_upload: async function(e) {
      let file = e.target.files[0];
      this.state = UPLOADING;
      const cf = await fetch("https://audio.freshair.workers.dev").then(r =>
        r.json()
      );

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
          this.state = POST;
          this.api_response = cf.access;
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
  }
});
</script>
<style scoped>
label {
  cursor: pointer;
}
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
