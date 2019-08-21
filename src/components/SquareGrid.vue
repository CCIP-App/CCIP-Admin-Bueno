<template>
  <div role="squareGrid" :style="`--edgeLength: ${edgeLength}`">
    <template v-for="(booth, index) in booths">
      <template v-if="showAnchor && booth.slug">
        <a :href="`#${booth.slug}`" :key="index">
          <Chip
            :logoUri="booth.imageUrl"
            :displayName="booth.displayText"
            :isActive="userStamps.findIndex(stamp => stamp.deliverer === booth.slug)> -1 || booth.isBonus"
          />
        </a>
      </template>
      <template v-else>
        <Chip
          :logoUri="booth.imageUrl"
          :displayName="booth.displayText"
          :isActive="userStamps.findIndex(stamp => stamp.deliverer === booth.slug)> -1 || booth.isBonus"
          :key="index"
        />
      </template>
    </template>
  </div>
</template>

<script>
export default {
  name: 'SquareGrid',
  props: {
    booths: {
      type: Array,
      default: () => []
    },
    userStamps: {
      type: Array,
      default: () => []
    },
    showAnchor: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    edgeLength () {
      return Math.ceil(Math.sqrt(this.booths.length, 2))
    }
  }
}
</script>

<style lang="stylus">
[role='squareGrid']
  display: grid
  margin: 1rem auto
  grid-template-rows: repeat(var(--edgeLength), auto)
  grid-template-columns: repeat(var(--edgeLength), auto)
  justify-content: center
  align-content: center
  [role='chip']
    border: 1px dashed rgba(0, 0, 0, 0.4)
    line-height: 1
    background: #fff
    display: flex
    align-items: center
    width: 100%
    height: 100%
    img
      display: inline-block
      margin: auto
      padding: 3px
      max-width: 100%
      max-height: 100%
  [role="stampImg"]
    width: calc((100% / var(--edgeLength)) / 2 * 1.5)
    height: calc((100% / var(--edgeLength)) / 2 * 1.5)
    z-index: 999
    display: none
</style>
