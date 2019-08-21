<template>
  <div id="app">
    <div class="header">
      <img
        class="logo"
        src="https://freshair.nyc3.cdn.digitaloceanspaces.com/resources/white-simple.png"
      />
      <h1 class="name" v-if="$root.$data.user.name">
        {{ $root.$data.user.name }}
      </h1>
    </div>
    <router-view />
  </div>
</template>

<style lang="less">
body,
html {
  margin: 0px;
  background: #ff9421;
}
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
#nav {
  padding: 30px;
  a {
    font-weight: bold;
    color: #2c3e50;
    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
.name {
  position: fixed;
  margin: 10px;
  right: 10px;
  top: 10px;
  color: white;
  font-size: 24px;
  line-height: 36px;
}
.logo {
  height: 56px;
  margin: 10px;
  position: fixed;
  top: 0px;
  left: 0px;
  object-fit: cover;
}
</style>
