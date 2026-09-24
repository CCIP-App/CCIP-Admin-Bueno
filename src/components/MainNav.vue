<template>
  <header>
    <v-app-bar dark fixed color="primary">
      <v-app-bar-nav-icon aria-label="切換選單" @click.stop="$emit('sidebar')"></v-app-bar-nav-icon>
      <v-toolbar-title>
        <span>OPass Admin - {{ event_name }}</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
    </v-app-bar>
  </header>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import portalApi from '@/module/portalApi'

defineEmits(['sidebar'])

const event_name = ref('')

onMounted(async () => {
  const eventInfo = await portalApi.getCurrentEvent()
  event_name.value = eventInfo.event_id
})
</script>
