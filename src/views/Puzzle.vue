<template>
  <div id="Puzzle">
    <v-row>
      <v-col xs12 md5>
        <qrcode-reader class="mr-3 mt-2" :enable="qrState" :width="'32vw'" :height="'24vw'" :noResult="true" @OnSuccess="onSuccess" @OnError="onError" />
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
  component: {

  },
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
      showConfirm: false
    }
  },
  methods: {
    onSuccess(token) {
      if (this.currentScanToken !== token) {
        this.currentScanToken = token
        this.alert = false
        apiClient.getPuzzle(this.sha1Gen(token))
          .then((res) => {
            if (res.valid) {
              this.players.push({
                nickname: res.user_id,
                token: token
              })
              this.chips = this.chips.concat(res.puzzle)
              this.tokens.push(token)
            } else {
              // Show dialog: user is invalid
              this.alertMessage = 'This player has been revoked.'
              this.alert = true
            }
          }, (err) => {
            // Show dialog: show request err
            if (err.response) {
              this.alertMessage = err.response.status + ' - ' + err.response.data.message
            } else {
              this.alertMessage = 'Something error on network'
            }
            this.alert = true
          })
          .then(() => {
            this.chipsConuter = this.chips.reduce((pv, cv) => {
              let specialChip = pv.find((el) => el.displayName === cv)
              if (specialChip === undefined) {
                pv.push({ displayName: cv, count: 1 })
              } else {
                specialChip.count++
              }
              return pv
            }, [])
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
      this.currentScanToken = ''
      this.players = []
      this.chips = []
      this.chipsConuter = []
      this.tokens = []
      this.alert = false
      this.alertMessage = ''
    },
    revokPlayer() {
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
    }
  },
  mounted() {
  }
}
</script>

<style lang="stylus">
  [role="chips"]
    flex-wrap: wrap;
    display: flex;
  [role="puzzle-player-item"]
    font-size: 2rem
  [role="alert"]
    font-size: 1.5rem
    padding: 0.7em
</style>
