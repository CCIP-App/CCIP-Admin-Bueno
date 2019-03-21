<template>
  <div role="chip">
    <v-card role="chip-card">
      <v-card-text class="cardContent">
        <p class="spinner ma-0">{{ displayName }}</p>
      </v-card-text>
    </v-card>
    <v-chip role="chip-count" class="primary white--text">{{ count }}</v-chip>
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
    count: {
      type: Number,
      default: 0
    }
  },
  mounted () {
  }
}
</script>

<style lang="stylus">
  .spinner
    text-align: center
    color: black
    font-size: 1.5rem

  .cardContent
    margin: 0 auto

  [role="chip-card"]
    width: 220px
    max-height: 60px
  [role="chip"]
    margin: 1em

  [role="chip-count"]
    margin-top: -1em
    margin-right: -0.5em
    z-index: 9999
    font-size: 2rem
    position: relative
    float: right
</style>
