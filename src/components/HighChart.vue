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
  mounted() {
    console.log(this.$el.clientWidth)
    Highcharts.chart('chart-' + this.idName, this.options)
  }
}
</script>

<style>

</style>
