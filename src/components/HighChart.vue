<template>
  <div :id="'chart-' + idName"  style="margin: 0 auto">

  </div>
</template>

<script>
import Highcharts from 'highcharts'
export default {
  props: {
    options: {
      type: Object,
      default: () => ({})
    },
    idName: {
      type: String
    }
  },
  watch: {
    options: function(value) {
      this.chart.update(value, true)
      return value
    }
  },
  mounted() {
    this.chart = Highcharts.chart('chart-' + this.idName, this.options)
  }
}
</script>

<style>

</style>
