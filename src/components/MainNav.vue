<template>
  <header>
    <v-toolbar app fixed :clipped-left="$vuetify.breakpoint.mdAndUp" class="pl-0">
      <v-toolbar-title style="width: 300px" class="ml-0 pl-3">
        <v-toolbar-side-icon @click.stop="$emit('sidebar')"></v-toolbar-side-icon>
        <span class="hidden-sm-and-down">SITCON Admin</span>
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