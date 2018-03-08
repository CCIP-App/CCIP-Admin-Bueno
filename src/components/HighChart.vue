<template>
  <div style="margin: 0 auto">

  </div>
</template>

<script>
import Highcharts from 'highcharts'
export default {
  props: {
    options: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      chart: null
    }
  },
  watch: {
    options: function(value) {
      this.chart.update(value, true)
      return value
    }
  },
  mounted() {
    this.chart = Highcharts.chart(this.$el, this.options)
  },
  beforeDestroy() {
    this.chart.destroy()
  }
}
</script>

<style>

</style>
