<template>
  <canvas class="chartjs" :width="width" :height="height"></canvas>
</template>

<script>
import Chart from 'chart.js' // With moment.js

const types = ['line', 'bar', 'radar', 'polarArea', 'pie', 'doughnut']

export default {

  props: {
    width: Number,
    height: Number,
    type: {
      type: String,
      required: true,
      validator(value) {
        return types.indexOf(value) > -1
      }
    },
    data: {
      type: Object,
      required: true,
      default: () => ({})
    },
    options: {
      type: Object,
      default: () => ({})
    }
  },

  mounted() {
    Chart.pluginService.register({
      beforeRender: function(chart) {
        console.log('call me maybe beforeRender')
        if (chart.config.options.showAllTooltips) {
          // create an array of tooltips
          // we can't use the chart tooltip because there is only one tooltip per chart
          chart.pluginTooltips = []
          chart.config.data.datasets.forEach(function(dataset, i) {
            chart.getDatasetMeta(i).data.forEach(function(sector, j) {
              chart.pluginTooltips.push(new Chart.Tooltip({
                _chart: chart.chart,
                _chartInstance: chart,
                _data: chart.data,
                _options: chart.options.tooltips,
                _active: [sector]
              }, chart))
            })
          })

          // turn off normal tooltips
          chart.options.tooltips.enabled = false
        }
      },
      afterDraw: function(chart, easing) {
        console.log('call me maybe afterDraw')
        if (chart.config.options.showAllTooltips) {
          // we don't want the permanent tooltips to animate, so don't do anything till the animation runs atleast once
          if (!chart.allTooltipsOnce) {
            if (easing !== 1) { return }
            chart.allTooltipsOnce = true
          }

          // turn on tooltips
          chart.options.tooltips.enabled = true
          Chart.helpers.each(chart.pluginTooltips, function(tooltip) {
            tooltip.initialize()
            tooltip.update()
            // we don't actually need this since we are not animating tooltips
            tooltip.pivot()
            tooltip.transition(easing).draw()
          })
          chart.options.tooltips.enabled = false
        }
      }
    })
    this.chart = new Chart(this.$el, {
      type: this.type,
      data: this.data,
      options: this.options
    })
  },

  data() {
    return {
      chart: null
    }
  },

  watch: {
    data(val) {
      this.$nextTick(() => {
        // this.chart.data.datasets = val.datasets
        // this.chart.data.labels = val.labels
        this.chart.update()
      })
    }
  }
}
</script>

<style lang="scss">
canvas.chartjs {
  max-width: 100%;
}
</style>
