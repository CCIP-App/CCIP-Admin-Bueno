<template>
  <header>
    <v-app-bar app fixed dark color="primary" :clipped-left="$vuetify.breakpoint.mdAndUp">
      <v-app-bar-nav-icon @click.stop="$emit('sidebar')"></v-app-bar-nav-icon>
      <v-toolbar-title>
        <v-toolbar-side-icon @click.stop="$emit('sidebar')"></v-toolbar-side-icon>
        <span class="hidden-sm-and-down">OPass Admin</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
    </v-app-bar>
  </header>
</template>

<script>
export default {
  name: 'main-nav'
}
</script>
<style lang="stylus" scoped>

</style>
