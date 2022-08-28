<template>
  <div id="RewardGame">
    <v-container>
      <v-row no-gutters>
        <v-col
          cols="12"
          md="5"
        >
          <qrcode-reader class="mr-3 mt-2 mb-3" :enable="qrState" :width="'32vw'" :height="'24vw'" :noResult="true" @OnSuccess="onSuccess" @OnError="onError" />
        </v-col>
        <v-col
          cols="12"
          md="7"
        >
          <v-alert dismissible warning v-model="alert" role="alert">{{ alertMessage }}</v-alert>
          <v-card>
            <v-card-title>Player</v-card-title>
            <v-card-text v-show="players.length > 0">
              <ul>
                <li v-for="(player, index) in players" role="reward-player-item" :key="index">{{ player.nickname }}：  {{ player.score }}</li>
              </ul>
            </v-card-text>
            <v-card-actions>
              <v-btn class="mr-2" color="primary" @click="clearPlayer">Clear All User</v-btn>
              <v-btn color="error" :loading="revoking" :disabled="revoking" @click="revokPlayer">Revoke those of player</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
    <v-snackbar
      v-model="snackbar.status"
    >
      {{ snackbar.text }}
      <v-btn
        color="pink"
        text
        @click="snackbar.status = false"
      >
        Close
      </v-btn>
    </v-snackbar>
  </div>
</template>

<script>
import apiClient from '../module/apiClient'
import sha1 from 'hash.js/lib/hash/sha/1'
export default {
  name: 'RewardGame',
  data () {
    return {
      qrState: true,
      players: [],
      tokens: [],
      alert: false,
      alertMessage: '',
      currentProcessToken: '',
      revoking: false,
      boothList: [],
      rewardConfig: {
        booths: [],
        confName: '',
        bingoPattern: '',
        title: {
          zh: '',
          en: ''
        }
      },
      snackbar: {
        status: false,
        text: ''
      }
    }
  },
  methods: {
    onSuccess (token) {
      if (this.currentScanToken !== token) {
        this.currentScanToken = token
        this.alert = false
        apiClient.getReward(this.sha1Gen(token))
          .then((res) => {
            if (!res.valid) {
              const bonusScore = this.rewardConfig.booths
                .filter(booth => booth.isBonus)
                .reduce((gotPoint, booth) => gotPoint + booth.point, 0)
              const userScore = res.deliverers.reduce((gotPoint, stamp) => {
                const deliverer = this.rewardConfig.booths.find(
                  booth => booth.slug === stamp.deliverer && !booth.isBonus
                )
                return deliverer && deliverer.point
                  ? gotPoint + Number(deliverer.point)
                  : gotPoint
              }, 0)
              this.players.push({
                nickname: res.user_id,
                token: token,
                score: bonusScore + userScore
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
    openToast (text) {
      this.snackbar.text = text
      this.snackbar.status = true
    },
    onError (err) {
      console.log(err)
    },
    sha1Gen (raw) {
      const hashGen = sha1()
      hashGen.update(raw)
      return hashGen.digest('hex')
    },
    clearPlayer () {
      this.openToast('玩家清單已經被清空(⊙ω⊙)')
      this.currentScanToken = ''
      this.players = []
      this.tokens = []
      this.alert = false
      this.alertMessage = ''
    },
    revokPlayer () {
      if (this.tokens.length === 0) {
        this.openToast('沒有東西可以註銷，不要亂戳(;´༎ຶД༎ຶ`)')
        return
      }

      // if (this.players.filter((el) => el.clear).length === 0) {
      //   this.openToast('沒有完成大地遊戲的玩家喔！')
      //   return
      // }
      this.revoking = this.loader = true
      Promise.all(this.players.map((el) => el.token).map((el) => apiClient.revokPlayer(el)))
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
    loadBoothList () {
      apiClient.getBoothList().then((res) => {
        this.boothList = res
      })
    },
    loadRewardConfig () {
      apiClient.getRewardConfig().then((res) => {
        this.rewardConfig = res
      })
    }
  },
  mounted () {
    this.loadBoothList()
    this.loadRewardConfig()
  }
}
</script>

<style lang="scss">
#RewardGame {
  [role="reward-player-item"] {
    font-size: 2rem;
    margin: 5px;
  }
  [role="alert"] {
    font-size: 1.5rem;
    padding: 0.7em;
  }
  [role="refresh"] {
    display: block;
    text-align: center;
  }
  [role="Tab"] {
    box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.16), 0 2px 10px 0 rgba(0, 0, 0, 0.12);
  }
  .tabs__item {
    transition: 0s
  }
}
</style>
