<template>
  <div id='Dashboard'>
    <v-container fluid>
      <v-row row wrap>
        <v-col cols="12" class="mb-3">
          <v-card>
            <v-card-text role="refreshCountDown">
              <span class="text-center">{{ countDown }} 秒後 Refresh 統計資料</span>
              <v-btn color="primary" dark @click="refresh">Refresh Now</v-btn>
              <v-select
                :items="roles"
                label="Roles"
                variant="solo"
                v-model="selectedRole"
              ></v-select>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" :md="6" :xl="4" class="mb-3">
          <v-card>
            <v-card-text>
              <h4 class="ma-0 text-left">App 使用率</h4>
              <p class="ma-0 mt-4">{{ appLogged }} / {{ appTotal }} - {{ appPercentage }}% ({{ selectedRole }}: {{ series.logged }} / {{ series.total }} - {{ rolePercentage }}%)</p>
              <v-progress-linear stream :buffer-value="Math.max(appPercentage, rolePercentage)" :model-value="Math.min(appPercentage, rolePercentage)" class="ma-0 mb-4"></v-progress-linear>
            </v-card-text>
          </v-card>
        </v-col>
        <template v-for="(data, n) in checkins" :key="'checkins'+data.scenario+n">
          <v-col cols="12" :md="6" :xl="4" class="mb-3">
            <v-card>
              <v-card-text>
                <h4 class="ma-0 text-left">{{ data.scenario }} 報到率</h4>
                <p class="ma-0 mt-4">{{ data.used }} / {{ data.enabled }} - {{ percentage(data.used, data.enabled) }}%</p>
                <v-progress-linear stream :buffer-value="percentage(data.used, data.enabled)" :model-value="percentage(data.used, data.enabled)" class="ma-0 mb-4"></v-progress-linear>
              </v-card-text>
            </v-card>
          </v-col>
        </template>
        <template v-for="(data, n) in series.series" :key="'charts'+data.scenario+n">
          <v-col cols="12" :md="6" :xl="4" class="mb-3">
            <v-card>
              <v-card-text>
                <h4 class="ma-0 text-left">Used for {{ data.scenario }}: Used {{ data.used }} / Enabled {{ data.enabled }} / Total {{ series.total }}</h4>
                <high-chart :options="chartOption(data.chart)" style="display: flex"></high-chart>
              </v-card-text>
            </v-card>
          </v-col>
        </template>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import apiClient from '../module/apiClient'
import HighChart from '@/components/HighChart.vue'

const countDown = ref(30)
const roles = ref([])
const selectedRole = ref('')
const datas = ref([])

const appLogged = computed(() => {
  const logged = datas.value.map((d) => d.logged)
  return logged.length > 0 ? logged.reduce((a, b) => a + b) : 0
})
const appTotal = computed(() => {
  const total = datas.value.map((d) => d.total)
  return total.length > 0 ? total.reduce((a, b) => a + b) : 0
})
const appPercentage = computed(() => {
  return percentage(appLogged.value, appTotal.value)
})
const rolePercentage = computed(() => {
  return Math.round((series.value.logged / series.value.total) * 10000) / 100 || 0
})
const series = computed(() => {
  const roles = datas.value.filter((d) => d.role === selectedRole.value)
  const role = roles.length > 0 ? roles[0] : null
  if (role !== null) {
    return {
      series: role.scenarios.map((scenario) => {
        return {
          chart: [
            {
              name: '已用',
              y: scenario.used
            },
            {
              name: '未用',
              y: role.total - scenario.enabled
            },
            {
              name: '能用未用',
              y: scenario.enabled - scenario.used
            }
          ],
          used: scenario.used,
          enabled: scenario.enabled,
          scenario: scenario.scenario
        }
      }),
      logged: role.logged,
      total: role.total,
      role: selectedRole.value
    }
  }
  return {}
})
const checkins = computed(() => {
  const checkins = datas.value.map((data) => data.scenarios).map((scenarios) => scenarios.filter((scenario) => scenario.scenario.match(/^day(.+)checkin$/))).flat()
  const days = [...new Set(checkins.map((checkin) => checkin.scenario).sort())]
  const allDays = days.map((day) => {
    const checkin = checkins.filter((checkin) => checkin.scenario === day)
    if (checkin.length > 0) {
      const data = checkin.reduce((a, b) => {
        return {
          enabled: a.enabled + b.enabled,
          used: a.used + b.used,
          scenario: day
        }
      })
      return data
    } else {
      return {}
    }
  })
  return allDays
})

function percentage (used, total) {
  return (Math.round(used / total * 1000) / 10) || 0
}

// Overwriting base render method with actual data.
function chartOption (datas) {
  return {
    credits: {
      enabled: false
    },
    chart: {
      type: 'pie',
      spacing: [0, 0, 0, 0]
    },
    title: {
      text: ''
    },
    plotOptions: {
      series: {
        dataLabels: {
          enabled: true,
          format:
            '<span style="font-size: 1.1rem">{point.name} - {point.y}</span>',
          distance: -30
        }
      }
    },

    tooltip: {
      headerFormat: '',
      pointFormat:
        '<span style="color:{point.color}">{point.name}</span>: <b>{point.y}</b><br/>'
    },
    series: [
      {
        name: 'Brands',
        colorByPoint: true,
        data: datas
      }
    ]
  }
}

function refresh () {
  countDown.value = 30
  apiClient.getDasboard().then(
    res => {
      datas.value = res.data
    },
    err => {
      console.error(err)
    }
  )
}

onMounted(() => {
  apiClient.getRoles().then((res) => {
    roles.value = res
    if (roles.value.length > 0) {
      selectedRole.value = roles.value[0]
    }
    refresh()
    setInterval(() => {
      countDown.value -= 1
      if (countDown.value === 0) {
        refresh()
      }
    }, 1000)
  })
})
</script>

<style lang="scss">
[role='refreshCountDown'] {
  font-size: 1.5rem;
  text-align: center;
}
</style>
