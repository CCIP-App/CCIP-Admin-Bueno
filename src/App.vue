<template>
  <v-app>
    <main-side v-model="drawer"></main-side>
    <main-nav v-on:sidebar="drawer = !drawer"></main-nav>

    <main>
      <v-main>
        <v-container fluid>
          <router-view v-slot="{ Component }">
            <transition name="slide" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </v-container>
      </v-main>
    </main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue'
import MainNav from '@/components/MainNav.vue'
import MainSide from '@/components/MainSide.vue'

const drawer = ref(true)
</script>
