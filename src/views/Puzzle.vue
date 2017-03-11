<template>
  <div id="Puzzle">
    <v-tabs id="puzzle-state" grow class="mb-3" role="Tab">
      <v-tabs-tabs>
        <v-tab-item :item="{ text: 'Total', href: '#total' }" ripple></v-tab-item>
        <v-tab-item :item="{ text: 'Currency', href: '#currency' }" ripple></v-tab-item>
      </v-tabs-tabs>
      <v-tabs-items>
        <v-tabs-item id="total">
          <v-card class="ma-0">
              <v-card-row>
                <v-card-column>
                  <div role="refresh" class="mb-3">
                    <v-btn primary dark @click.native="loadDashboard">Refresh Now</v-btn>
                    <div class="text-xs-center mt-1">{{ countDown }} 秒後 Refresh 統計資料</div>
                  </div>
                  <high-chart :options="defaultChartOption(chartData.total)"  style="display: flex" idName="puzzleDash-1"></high-chart>
                </v-card-column>
                <v-card-column class="ma-3">
                  <table>
                    <thead>
                      <tr>
                        <th>Puzzle</th>
                        <th>Quantity</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="chip in puzzle">
                        <td>{{ chip.puzzle }}</td>
                        <td>{{ chip.quantity }}</td>
                      </tr>
                    </tbody>
                  </table>
                </v-card-column>
              </v-card-row>
            </v-card-text>
          </v-card>
        </v-tabs-item>
        <v-tabs-item id="currency">
          <v-card class="ma-0">
            <v-card-row>
              <v-card-column>
                <div role="refresh" class="mb-3">
                  <v-btn primary dark @click.native="loadDashboard">Refresh Now</v-btn>
                  <div class="text-xs-center mt-1">{{ countDown }} 秒後 Refresh 統計資料</div>
                </div>
                <high-chart :options="defaultChartOption(chartData.currency)"  style="display: flex" idName="puzzleDash-2"></high-chart>
              </v-card-column>
              <v-card-column class="ma-3">
                <table>
                  <thead>
                    <tr>
                      <th>Puzzle</th>
                      <th>Currency</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="chip in puzzle">
                      <td>{{ chip.puzzle }}</td>
                      <td>{{ chip.currency }}</td>
                    </tr>
                  </tbody>
                </table>
              </v-card-column>
            </v-card-row>
          </v-card>
        </v-tabs-item>
      </v-tabs-items>
    </v-tabs>
    <v-row>
      <v-col xs12 md5>
        <qrcode-reader class="mr-3 mt-2 mb-3" :enable="qrState" :width="'32vw'" :height="'24vw'" :noResult="true" @OnSuccess="onSuccess" @OnError="onError" />
      </v-col>
      <v-col xs12 md7>
        <v-alert dismissible warning v-model="alert" role="alert">{{ alertMessage }}</v-alert>
        <v-card>
          <v-card-row  class="green darken-1">
            <v-card-title>
              <span class="white--text">Player</span>
            </v-card-title>
          </v-card-row>
          <v-card-text>
            <v-card-row>
              <ul>
                <li v-for="player in players" role="puzzle-player-item">{{ player.nickname }} ({{ player.token.slice(0, 10) }})</li>
              </ul>
            </v-card-row>
          </v-card-text>
          <v-card-row actions>
            <v-btn class="lighten-2 white--text mr-2" info v-on:click.native="clearPlayer">Clear All User</v-btn>
            <v-btn class="lighten-2 white--text" error :loading="revoking" :disabled="revoking" v-on:click.native="revokPlayer">Revoke those of player</v-btn>
          </v-card-row>
        </v-card>
      </v-col>
    </v-row>

    <div class="mt-3" role="puzzle-chips">
      <v-card>
        <v-card-row class="green darken-1">
          <v-card-title>
          <span class="white--text">Puzzle Bucket</span>
          </v-card-title>
        </v-card-row>
        <v-card-row role="chips">
          <Chip v-for="chip in chipsConuter" :displayName="chip.displayName" :count="chip.count" >
        </v-card-row>
      </v-card>
    </div>

  </div>
</template>

<script>
import apiClient from '../modal/apiClient'
import crypto from 'crypto'
export default {
  name: 'Puzzle',
  data() {
    return {
      qrState: true,
      players: [],
      chips: [],
      chipsConuter: [],
      tokens: [],
      alert: false,
      alertMessage: '',
      currentProcessToken: '',
      revoking: false,
      puzzle: [
        {
          'puzzle': '>',
          'quantity': 5
        },
        {
          'puzzle': 'total',
          'quantity': 62
        }
      ],
      countDown: 30
    }
  },
  computed: {
    chartData() {
      return {
        total: this.puzzle.filter((el) => el.puzzle !== 'total').map((el) => ({
          name: el.puzzle, y: el.quantity
        })),
        currency: this.puzzle.filter((el) => el.puzzle !== 'total').map((el) => ({
          name: el.puzzle, y: el.currency
        }))
      }
    }
  },
  methods: {
    onSuccess(token) {
      if (this.currentScanToken !== token) {
        this.currentScanToken = token
        this.alert = false
        apiClient.getPuzzle(this.sha1Gen(token))
          .then((res) => {
            if (!res.valid) {
              this.players.push({
                nickname: res.user_id,
                token: token
              })
              this.chips = this.chips.concat(res.puzzle)
              this.tokens.push(token)

              this.chipsConuter = this.chips.reduce((pv, cv) => {
                let specialChip = pv.find((el) => el.displayName === cv)
                if (specialChip === undefined) {
                  pv.push({ displayName: cv, count: 1 })
                } else {
                  specialChip.count++
                }
                return pv
              }, [])
            } else {
              // Show dialog: user is invalid
              this.alertMessage = 'This player has been revoked.'
              this.alert = true
            }
          })
          .catch((err) => {
            // Show dialog: show request err
            if (err.response) {
              this.alertMessage = err.response.status + ' - ' + err.response.data.message
            } else {
              this.alertMessage = 'Something error on network'
            }
            this.alert = true
          })
      }
    },
    onError(err) {
      console.log(err)
    },
    sha1Gen(raw) {
      let hashGen = crypto.createHash('sha1')
      hashGen.update(raw)
      return hashGen.digest('hex')
    },
    clearPlayer() {
      this.$vuetify.toast.create(...['玩家清單已經被清空(⊙ω⊙)', 'bottom'])
      this.currentScanToken = ''
      this.players = []
      this.chips = []
      this.chipsConuter = []
      this.tokens = []
      this.alert = false
      this.alertMessage = ''
    },
    revokPlayer() {
      var self = this
      if (this.tokens.length === 0) {
        self.$vuetify.toast.create(...['沒有東西可以註銷，不要亂戳(;´༎ຶД༎ຶ`)', 'bottom'])
        return
      }
      this.revoking = this.loader = true
      this.chips = []
      this.chipsConuter = []
      Promise.all(this.tokens.map((el) => apiClient.revokPlayer(el)))
        .then((ress) => {
          ress.forEach((res) => {
            if (res.successful) {
              this.tokens.splice(this.tokens.indexOf(res.token), 1)
              this.players.find((el) => el.token === res.token).nickname += ' - 已註銷'
            }
          })
        })
        .catch((err) => {
          console.error(err)
        })
        .then(() => {
          this.revoking = false
        })
    },
    defaultChartOption(datas) {
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
              format: '{point.name}<br> {point.percentage:.2f} %',
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
    loadDashboard() {
      this.countDown = 30
      apiClient.getPuzzleDashboard()
        .then((res) => {
          this.puzzle = res
        })
        .catch((err) => {
          console.error(err)
        })
    }
  },
  mounted() {
    this.loadDashboard()
    setInterval(() => {
      this.countDown -= 1
      if (this.countDown === 0) {
        this.loadDashboard()
      }
    }, 1000)
  }
}
</script>

<style lang="stylus">
  #Puzzle
    [role="puzzle-player-item"]
      font-size: 2rem
    [role="alert"]
      font-size: 1.5rem
      padding: 0.7em
    [role="refresh"]
      display: block
      text-align: center
    [role="Tab"]
      box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.16), 0 2px 10px 0 rgba(0, 0, 0, 0.12);

    .tabs__item
      transition: 0s
</style>
