<template>
  <div ref="root" class="highcharts-light" style="margin: 0 auto">

  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, useTemplateRef, watch } from 'vue'
import Highcharts from 'highcharts'

const props = defineProps({
  options: {
    type: Object
  }
})

const root = useTemplateRef('root')
let chart = null
let oldValue = ''

watch(() => props.options, (value) => {
  if (oldValue !== JSON.stringify(value)) {
    chart.update(value, true)
    oldValue = JSON.stringify(value)
  }
})

onMounted(() => {
  chart = Highcharts.chart(root.value, props.options)
  oldValue = JSON.stringify(props.options)
})

onBeforeUnmount(() => {
  chart.destroy()
})
</script>
