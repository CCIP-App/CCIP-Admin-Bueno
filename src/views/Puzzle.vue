<template>
  <div id="Puzzle">
    <v-layout>
      <v-flex xs12 md5>
        <qrcode-reader class="mr-3 mt-2 mb-3" :enable="qrState" :width="'32vw'" :height="'24vw'" :noResult="true" @OnSuccess="onSuccess" @OnError="onError" />
      </v-flex>
      <v-flex xs12 md7>
        <v-alert dismissible type="warning" v-model="alert" role="alert">{{ alertMessage }}</v-alert>
        <v-card>
          <!-- <v-card-row  class="green darken-1"> -->
            <v-card-title>
              <span class="white--text">Player</span>
            </v-card-title>
          <!-- </v-card-row> -->
          <v-card-text>
            <!-- <v-card-row> -->
              <ul>
                <li v-for="(player, index) in players" role="puzzle-player-item" :key="index">{{ player.nickname }}：{{ player.clear ? '已完成':'尚未完成' }}</li>
              </ul>
            <!-- </v-card-row> -->
          </v-card-text>
          <!-- <v-card-row actions> -->
            <v-btn class="lighten-2 mr-2" info v-on:click.native="clearPlayer">Clear All User</v-btn>
            <v-btn class="lighten-2" error :loading="revoking" :disabled="revoking" v-on:click.native="revokPlayer">Revoke those of player</v-btn>
          <!-- </v-card-row> -->
        </v-card>
      </v-flex>
    </v-layout>

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
      tokens: [],
      alert: false,
      alertMessage: '',
      currentProcessToken: '',
      revoking: false,
      boothList: []
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
                token: token,
                clear: this.boothList.filter((el) => res.deliverer.indexOf(el) === -1).length === 0
              })
              this.tokens.push(token)
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
      this.alertMessage = '玩家清單已經被清空(⊙ω⊙)'
      // this.$vuetify.toast.create(...['玩家清單已經被清空(⊙ω⊙)', 'bottom'])
      this.currentScanToken = ''
      this.players = []
      this.tokens = []
      this.alert = false
      this.alertMessage = ''
    },
    revokPlayer() {
      var self = this
      if (this.tokens.length === 0) {
        self.alertMessage = '沒有東西可以註銷，不要亂戳(;´༎ຶД༎ຶ`)'
        // self.$vuetify.toast.create(...['沒有東西可以註銷，不要亂戳(;´༎ຶД༎ຶ`)', 'bottom'])
        return
      }

      if (this.players.filter((el) => el.clear).length === 0) {
        self.alertMessage = '沒有完成大地遊戲的玩家喔！'
        // self.$vuetify.toast.create(...['沒有完成大地遊戲的玩家喔！', 'bottom'])
        return
      }
      this.revoking = this.loader = true
      Promise.all(this.players.filter((el) => el.clear).map((el) => el.token).map((el) => apiClient.revokPlayer(el)))
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
    loadBoothList() {
      apiClient.getBoothList().then((res) => {
        this.boothList = res
      })
    }
  },
  mounted() {
    this.loadBoothList()
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
