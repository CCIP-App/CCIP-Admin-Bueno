<template>
  <header>
    <v-app-bar dark fixed color="primary">
      <v-app-bar-nav-icon @click.stop="$emit('sidebar')"></v-app-bar-nav-icon>
      <v-toolbar-title>
        <span>OPass Admin - {{ event_name }}</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
    </v-app-bar>
  </header>
</template>

<script>
import portalApi from '@/module/portalApi'

export default {
  name: 'main-nav',
  data () {
    return {
      event_name: ''
    }
  },
  async mounted () {
    const eventInfo = await portalApi.getCurrentEvent()
    this.event_name = eventInfo.event_id
  }
}
</script>
