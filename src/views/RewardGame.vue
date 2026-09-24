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
          <v-alert closable type="warning" v-model="alert" role="alert">{{ alertMessage }}</v-alert>
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
        variant="text"
        @click="snackbar.status = false"
      >
        Close
      </v-btn>
    </v-snackbar>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import apiClient from '../module/apiClient'
import { sha1Hex } from '@/utils/hash.js'
import QrcodeReader from '@/components/QrcodeReader.vue'

const qrState = ref(true)
const players = ref([])
const tokens = ref([])
const alert = ref(false)
const alertMessage = ref('')
const revoking = ref(false)
const boothList = ref([])
const rewardConfig = ref({
  booths: [],
  confName: '',
  bingoPattern: '',
  title: {
    zh: '',
    en: ''
  }
})
const snackbar = ref({
  status: false,
  text: ''
})
// Not reactive and initially undefined, as before (it was never declared in data)
let currentScanToken

function onSuccess (token) {
  if (currentScanToken !== token) {
    currentScanToken = token
    alert.value = false
    apiClient.getReward(sha1Hex(token))
      .then((res) => {
        if (!res.valid) {
          const bonusScore = rewardConfig.value.booths
            .filter(booth => booth.isBonus)
            .reduce((gotPoint, booth) => gotPoint + booth.point, 0)
          const userScore = res.deliverers.reduce((gotPoint, stamp) => {
            const deliverer = rewardConfig.value.booths.find(
              booth => booth.slug === stamp.deliverer && !booth.isBonus
            )
            return deliverer && deliverer.point
              ? gotPoint + Number(deliverer.point)
              : gotPoint
          }, 0)
          players.value.push({
            nickname: res.user_id,
            token: token,
            score: bonusScore + userScore
          })
          tokens.value.push(token)
        } else {
          // Show dialog: user is invalid
          alertMessage.value = 'This player has been revoked.'
          alert.value = true
        }
      })
      .catch((err) => {
        // Show dialog: show request err
        if (err.response) {
          alertMessage.value = err.response.status + ' - ' + err.response.data.message
        } else {
          alertMessage.value = 'Something error on network'
        }
        alert.value = true
      })
  }
}

function openToast (text) {
  snackbar.value.text = text
  snackbar.value.status = true
}

function onError (err) {
  console.log(err)
}

function clearPlayer () {
  openToast('玩家清單已經被清空(⊙ω⊙)')
  currentScanToken = ''
  players.value = []
  tokens.value = []
  alert.value = false
  alertMessage.value = ''
}

function revokPlayer () {
  if (tokens.value.length === 0) {
    openToast('沒有東西可以註銷，不要亂戳(;´༎ຶД༎ຶ`)')
    return
  }

  // if (players.value.filter((el) => el.clear).length === 0) {
  //   openToast('沒有完成大地遊戲的玩家喔！')
  //   return
  // }
  revoking.value = true
  Promise.all(players.value.map((el) => el.token).map((el) => apiClient.revokPlayer(el)))
    .then((ress) => {
      ress.forEach((res) => {
        if (res.successful) {
          tokens.value.splice(tokens.value.indexOf(res.token), 1)
          players.value.find((el) => el.token === res.token).nickname += ' - 已註銷'
        }
      })
    })
    .catch((err) => {
      console.error(err)
    })
    .then(() => {
      revoking.value = false
    })
}

function loadBoothList () {
  apiClient.getBoothList().then((res) => {
    boothList.value = res
  })
}

function loadRewardConfig () {
  apiClient.getRewardConfig().then((res) => {
    rewardConfig.value = res
  })
}

onMounted(() => {
  loadBoothList()
  loadRewardConfig()
})
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
