<template>
  <div id='Dashboard'>
    <v-container fluid>
      <v-layout row wrap>
        <v-flex xs12 class="mb-3">
          <v-card>
            <v-card-text role="refreshCountDown">
              <span class="text-xs-center">{{ countDown }} 秒後 Refresh 統計資料</span>
              <v-btn color="primary" dark @click.native="refresh">Refresh Now</v-btn>
              <v-select
                :items="roles"
                label="Roles"
                solo
                v-model="selectedRole"
              ></v-select>
            </v-card-text>
          </v-card>
        </v-flex>
        <v-flex xs12 md6 xl4 class="mb-3">
          <v-card>
            <v-card-text>
              <h4 class="ma-0 text-xs-left">App 使用率</h4>
              <p class="text-xs-center ma-0 mt-4">{{ appLogged }} / {{ appTotal }} - {{ appPercentage }}% ({{ selectedRole }}: {{ this.series.logged }} / {{ this.series.total }} - {{ rolePercentage }}%)</p>
              <v-progress-linear stream :buffer-value="Math.max(appPercentage, rolePercentage)" :value="Math.min(appPercentage, rolePercentage)" class="ma-0 mb-4"></v-progress-linear>
            </v-card-text>
          </v-card>
        </v-flex>
        <template v-for="(data, n) in checkins">
          <v-flex :key="'checkins'+data.scenario+n" xs12 md6 xl4 class="mb-3">
            <v-card>
              <v-card-text>
                <h4 class="ma-0 text-xs-left">{{ data.scenario }} 報到率</h4>
                <p class="text-xs-center ma-0 mt-4">{{ data.used }} / {{ data.enabled }} - {{ percentage(data.used, data.enabled) }}%</p>
                <v-progress-linear stream :buffer-value="percentage(data.used, data.enabled)" :value="percentage(data.used, data.enabled)" class="ma-0 mb-4"></v-progress-linear>
              </v-card-text>
            </v-card>
          </v-flex>
        </template>
        <template v-for="(data, n) in series.series">
          <v-flex :key="'charts'+data.scenario+n" xs12 md6 xl4 class="mb-3">
            <v-card>
              <v-card-text>
                <h4 class="ma-0 text-xs-left">Used for: {{ data.scenario }} {{ data.used }} / {{ series.total }}</h4>
                <high-chart :options="chartOption(data.chart)" style="display: flex"></high-chart>
              </v-card-text>
            </v-card>
          </v-flex>
        </template>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
import apiClient from '../module/apiClient'
export default {
  name: 'Dashboard',
  data () {
    return {
      countDown: 30,
      roles: [],
      selectedRole: '',
      datas: []
    }
  },
  computed: {
    appLogged () {
      let logged = this.datas.map((d) => d.logged)
      return logged.length > 0 ? logged.reduce((a, b) => a + b) : 0
    },
    appTotal () {
      let total = this.datas.map((d) => d.total)
      return total.length > 0 ? total.reduce((a, b) => a + b) : 0
    },
    appPercentage () {
      return this.percentage(this.appLogged, this.appTotal)
    },
    rolePercentage () {
      return Math.round((this.series.logged / this.series.total) * 10000) / 100 || 0
    },
    series () {
      let roles = this.datas.filter((d) => d.role === this.selectedRole)
      let role = roles.length > 0 ? roles[0] : null
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
          role: this.selectedRole
        }
      }
      return {}
    },
    checkins () {
      let checkins = this.datas.map((data) => data.scenarios).map((scenarios) => scenarios.filter((scenario) => scenario.scenario.match(/^day(.+)checkin$/))).flat()
      let days = [...new Set(checkins.map((checkin) => checkin.scenario).sort())]
      let allDays = days.map((day) => {
        let checkin = checkins.filter((checkin) => checkin.scenario === day)
        if (checkin.length > 0) {
          let data = checkin.reduce((a, b) => {
            a.enabled += b.enabled
            a.used += b.used
            return a
          })
          return data
        } else {
          return {}
        }
      })
      return allDays
    }
  },
  methods: {
    percentage (used, total) {
      return (Math.round(used / total * 1000) / 10) || 0
    },
    // Overwriting base render method with actual data.
    chartOption (datas) {
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
    },
    refresh () {
      this.countDown = 30
      apiClient.getDasboard().then(
        res => {
          this.datas = res.data
        },
        err => {
          console.error(err)
        }
      )
    }
  },
  mounted () {
    let self = this
    apiClient.getRoles().then((roles) => {
      self.roles = roles
      if (self.roles.length > 0) {
        self.selectedRole = self.roles[0]
      }
      self.refresh()
      setInterval(() => {
        self.countDown -= 1
        if (self.countDown === 0) {
          self.refresh()
        }
      }, 1000)
    })
  }
}
</script>

<style lang="stylus">
[role='refreshCountDown'] {
  font-size: 1.5rem;
  text-align: center;
}
</style>
