<template>
  <div role="chip" :class="{ active: isActive }">
    <img role="logo" :src="logourl" :alt="displayName">
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  displayName: {
    type: String,
    default: ''
  },
  logoUri: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: false
  }
})

const logourl = computed(() => props.logoUri)
</script>

<style lang="scss" scoped>
[role="chip"] {
  position: relative;
}
.active {
  &:before {
    content: '';
    position: absolute;
    top: 0px;
    left: 0px;
    bottom: 0px;
    right: 0px;
    background-image: url('../assets/OPASS-pass-stamp.png');
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
  };
}
</style>
