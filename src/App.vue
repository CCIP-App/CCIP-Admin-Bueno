<template>
  <v-app>

    <main-side v-model="drawer"></main-side>
    <main-nav v-on:sidebar="drawer = !drawer"></main-nav>

    <main>
      <v-main>
        <v-container fluid>
          <transition name="slide" mode="out-in">
            <router-view></router-view>
          </transition>
        </v-container>
      </v-main>
    </main>
  </v-app>
</template>

<script>
export default {
  data () {
    return {
      drawer: true
    }
  },

  mounted () {
  }
}
</script>

<style lang="stylus">

</style>
