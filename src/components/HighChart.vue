<template>
  <div style="margin: 0 auto">

  </div>
</template>

<script>
import Highcharts from 'highcharts'
export default {
  props: {
    options: {
      type: Object
    }
  },
  data () {
    return {
      chart: null,
      oldValue: ''
    }
  },
  watch: {
    options: function (value) {
      if (this.oldValue !== JSON.stringify(value)) {
        this.chart.update(value, true)
        this.oldValue = JSON.stringify(value)
      }
      return value
    }
  },
  mounted () {
    this.chart = Highcharts.chart(this.$el, this.options)
    this.oldValue = JSON.stringify(this.options)
  },
  beforeUnmount () {
    this.chart.destroy()
  }
}
</script>
