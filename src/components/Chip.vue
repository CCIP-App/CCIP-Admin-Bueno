<template>
  <div role="chip" :class="{ active: isActive }">
    <img role="logo" :src="logourl" :alt="displayName">
  </div>
</template>

<script>
export default {
  name: 'Chip',
  props: {
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
  },
  computed: {
    logourl () {
      return this.logoUri
    }
  }
}
</script>

<style lang="stylus" scoped>
[role="chip"]
  position relative
.active
  &:before
    content: ''
    position absolute
    top 0px
    left 0px
    bottom 0px
    right 0px
    background-image url('../assets/OPASS-pass-stamp.png')
    background-size contain
    background-repeat no-repeat
    background-position center
</style>
