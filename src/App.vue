<template>
  <v-app top-fixed-navbar left-fixed-sidebar>
    
    <main-nav></main-nav>
    
    <main>
      <main-side></main-side>
      <v-content>
        <v-container fluid>
          <transition name="slide" mode="out-in">
            <router-view class="pa-4"></router-view>
          </transition>
        </v-container>
      </v-content>
    </main>
  </v-app>
</template>

<script>
  export default {
    data () {
      return {
        
      }
    },

    mounted () {
      this.$vuetify.init()
    }
  }
</script>

<style lang="stylus">
  @import './stylus/main'
</style>