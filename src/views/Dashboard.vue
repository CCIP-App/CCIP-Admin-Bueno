<template>
  <div id='Dashboard'>
    <v-container fluid>
      <v-row xs12 class="mb-3">
        <v-card>
          <v-card-text role="refreshCountDown">
            <span class="text-xs-center">{{ countDown }} 秒後 Refresh 統計資料</span>
            <v-btn primary dark @click.native="refresh">Refresh Now</v-btn>
          </v-card-text>
        </v-card>
      </v-row>
      <v-row>
        <v-col xs12 class="mb-3">
          <v-card>
            <v-card-text>
              <h4 class="ma-0 text-xs-left">App 使用率</h4>
              <p class="text-xs-center ma-0 mt-4">{{ appLogged + " / " + totalUser + " - " + appPrecnetage + "%"}}</p>
              <v-progress-linear v-model="appPrecnetage" class="ma-0 mb-4"></v-progress-linear>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      <v-row>
        <v-col xs12 md12 class="mb-3">
          <v-card>
            <v-card-text>
              <h4 class="ma-0 text-xs-left">即時報到率</h4>
              <high-chart :options="defaultOption(attendees)" style="display: flex" idName="1"></high-chart>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      <v-row>
        <v-col xs12 md6 xl4 class="mb-3">
          <v-card>
            <v-card-text>
              <h4 class="ma-0 text-xs-left">午餐(葷)已報到 {{ lunch.meat.total }}</h4>
              <high-chart :options="defaultOption(lunch.meat.chart)" style="display: flex" idName="2"></high-chart>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col xs12 md6 xl4 class="mb-3">
          <v-card>
            <v-card-text>
              <h4 class="ma-0 text-xs-left">午餐(素)已報到 {{ lunch.vegetarian.total }}</h4>
              <high-chart :options="defaultOption(lunch.vegetarian.chart)" style="display: flex" idName="3"></high-chart>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col xs12 md6 xl4 class="mb-3">
          <v-card>
            <v-card-text>
              <h4 class="ma-0 text-xs-left">迎賓袋領取 {{ totalUser }}</h4>
              <high-chart :options="defaultOption(kit.normal.chart)" style="display: flex" idName="4"></high-chart>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col xs12 md6 xl4 class="mb-3">
          <v-card>
            <v-card-text>
              <h4 class="ma-0 text-xs-left">個人贊助領取 {{ kit.vip.total }}</h4>
              <high-chart :options="defaultOption(kit.vip.chart)" style="display: flex" idName="5"></high-chart>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
  import apiClient from '../modal/apiClient'
  export default {
    name: 'Dashboard',
    data() {
      return {
        CIData: {
          logged: 0,
          total: 0,
          day1checkin_used: 0,
          day1lunch: {
            meat: 0,
            meat_used: 0,
            total: 0,
            vegetarian: 0,
            vegetarian_used: 0
          },
          kit_used: 0,
          vipkit: {
            total: 3,
            used: 0
          }
        },
        countDown: 30
      }
    },
    computed: {
      appLogged() {
        return this.CIData.logged
      },
      totalUser() {
        return this.CIData.total
      },
      appPrecnetage() {
        return Math.round(this.appLogged / this.totalUser * 100)
      },
      attendees() {
        return [
          {
            name: '已報到',
            y: this.CIData.day1checkin_used
          },
          {
            name: '未報到',
            y: this.CIData.total - this.CIData.day1checkin_used
          }
        ]
      },
      lunch() {
        return {
          meat: {
            total: this.CIData.day1lunch.meat,
            chart: [
              {
                name: '已領取',
                y: this.CIData.day1lunch.meat_used
              },
              {
                name: '未領取',
                y: this.CIData.day1lunch.meat - this.CIData.day1lunch.meat_used
              }
            ]
          },
          vegetarian: {
            total: this.CIData.day1lunch.vegetarian,
            chart: [
              {
                name: '已領取',
                y: this.CIData.day1lunch.vegetarian_used
              },
              {
                name: '未領取',
                y: this.CIData.day1lunch.vegetarian - this.CIData.day1lunch.vegetarian_used
              }
            ]
          }
        }
      },
      kit() {
        return {
          normal: {
            chart: [
              {
                name: '已領取',
                y: this.CIData.kit_used
              },
              {
                name: '未領取',
                y: this.totalUser - this.CIData.kit_used
              }
            ]
          },
          vip: {
            total: this.CIData.vipkit.total,
            chart: [
              {
                name: '已領取',
                y: this.CIData.vipkit.used
              },
              {
                name: '未領取',
                y: this.CIData.vipkit.total - this.CIData.vipkit.used
              }
            ]
          }
        }
      }
    },
    methods: {
      // Overwriting base render method with actual data.
      defaultOption(datas) {
        return {
          chart: {
            type: 'pie',
            spacing: [0, 0, 0, 0],
            reflow: true
          },
          title: {
            text: ''
          },
          plotOptions: {
            series: {
              dataLabels: {
                enabled: true,
                format: '<span style="font-size: 1.1rem">{point.name} - {point.y}</span>',
                distance: -30
              }
            }
          },

          tooltip: {
            headerFormat: '',
            pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y}</b><br/>'
          },
          series: [{
            name: 'Brands',
            colorByPoint: true,
            data: datas
          }]
        }
      },
      refresh() {
        this.countDown = 30
        apiClient.getDasboard()
          .then((res) => {
            this.CIData = res.data
          }, (err) => {
            console.error(err)
          })
      }
    },
    mounted() {
      this.refresh()
      setInterval(() => {
        this.countDown -= 1
        if (this.countDown === 0) {
          this.refresh()
        }
      }, 1000)
    }
  }
</script>

<style lang="stylus">
 [role="refreshCountDown"]
   font-size: 1.5rem
   text-align: center
</style>
