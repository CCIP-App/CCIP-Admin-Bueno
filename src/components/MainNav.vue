<template>
  <header>
    <v-navbar fixed class="pl-0">
      <v-btn v-side-bar:mainsidebar="" floating class="side-icon hidden-md-and-up transparent z-depth-0" ripple >
        <v-icon>menu</v-icon>
      </v-btn>
      <div class="navbar__side-title">
        <img src="~public/sitcon.svg" height="25vh">
        <p class="ma-0 pa-2"> Admin</p>
      </div>
    </v-navbar>
  </header>
</template>

<script>
  export default {
    name: 'main-nav',
  }
</script>
<style lang="stylus" scoped>
  @import '../stylus/settings/_variables'
 
  .navbar {
    align-items: center;
    color: #fff;
  }
  
  .side-icon {
    margin: 0 1rem;
  }
  
  .navbar__side-title 
    display: flex
    flex: 1
    align-items: center
    justify-content: center
    flex-direction: center
    margin: 0 0rem
    font-size: 15px
  
  

  
</style>