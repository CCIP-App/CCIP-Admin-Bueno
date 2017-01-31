<template>
  <div class="progress-container">
    <div class="has-text-centered" v-if="showLabel">{{value}} / {{max}} - {{percentage + '%'}}</div>
    <progress :class="['progress', type ? `is-${type}` : '', size ? `is-${size}` : '']" :value="value" :max="max"></progress>
  </div>
</template>

<script>
/*
  Modify from https://raw.githubusercontent.com/vue-bulma/progress-bar/master/src/ProgressBar.vue
 */
export default {
  props: {
    type: String,
    size: String,
    value: {
      type: Number,
      required: true,
      default: 0
    },
    max: {
      type: Number,
      required: true,
      default: 0
    },
    showLabel: Boolean
  },

  computed: {
    percentage() {
      return this.value / this.max * 100
    }
  }

}
</script>

<style lang="scss">
.progress-container {
  align-items: center;
  margin-bottom: 20px;

  .progress {
    position: relative;
    margin-bottom: 0 !important;
  }

  .progress + span {
    margin-left: 10px;
    min-width: 36px;
    text-align: right;
  }
}
</style>
