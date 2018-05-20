<template>
  <header>
    <v-toolbar app fixed dark color="primary" :clipped-left="$vuetify.breakpoint.mdAndUp">
      <v-toolbar-title>
        <v-toolbar-side-icon @click.stop="$emit('sidebar')"></v-toolbar-side-icon>
        <span class="hidden-sm-and-down">PyConTW Admin</span>
      </v-toolbar-title>
    </v-toolbar>
  </header>
</template>

<script>
  export default {
    name: 'main-nav',
  }
</script>
<style lang="stylus" scoped>

</style>