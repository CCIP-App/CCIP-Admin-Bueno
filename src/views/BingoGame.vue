<template>
  <div id="BingoGame">
    <v-container>
      <v-row no-gutters>
        <v-col
          :cols="12"
          :md="5"
        >
          <qrcode-reader class="mr-3 mt-2 mb-3" :enable="qrState" :width="'32vw'" :height="'24vw'" :noResult="true" @OnSuccess="onSuccess" @OnError="onError" />
        </v-col>
        <v-col
          :cols="12"
          :md="7"
        >
          <v-alert closable type="warning" v-model="alert" role="alert">{{ alertMessage }}</v-alert>
          <v-card>
            <v-card-title>Player</v-card-title>
            <v-card-text v-show="player.token !== ''">
              <h2>{{ player.nickname }}</h2><br>
              <h2>{{ `已達成 ${countBingos} 連線` }}</h2>
              <SquareGrid style="width: 80%" :booths="shuffledBoothList" :userStamps="stamps" :showAnchor="true" />
            </v-card-text>
            <v-card-actions>
              <v-btn class="mr-2" color="primary" @click="clearPlayer">Clear User</v-btn>
              <v-btn color="error" :loading="revoking" :disabled="revoking" @click="revokPlayer">Revoke player</v-btn>
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
import { computed, onMounted, ref } from 'vue'
import apiClient from '../module/apiClient'
import { sha1Hex } from '@/utils/hash.js'
import bingoShuffler from '@/utils/shuffledBingo.js'
import QrcodeReader from '@/components/QrcodeReader.vue'
import SquareGrid from '@/components/SquareGrid.vue'

const qrState = ref(true)
const player = ref({
  nickname: '',
  token: ''
})
const stamps = ref([])
const alert = ref(false)
const alertMessage = ref('')
const currentScanToken = ref('')
const revoking = ref(false)
const boothList = ref([])
const bingoConfig = ref({
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

const shuffledBoothList = computed(() => {
  if (bingoConfig.value.booths.length === 0) return []

  const shuffled = bingoShuffler(bingoConfig.value.bingoPattern)(
    player.value.token || '',
    bingoConfig.value.booths.map(booth => ({
      ...booth,
      displayText: booth.displayText['zh-TW']
    }))
  )
  return shuffled
})

const countBingos = computed(() => {
  const itemNum = shuffledBoothList.value.length
  if (itemNum === 0) return 0
  const edgeL = Math.ceil(Math.sqrt(itemNum))
  let bingosIndex = []
  // Horizontal
  const horizontal = []
  for (let start = 0; start < itemNum; start += edgeL) {
    horizontal.push(Array.from({ length: Math.min(edgeL, itemNum - start) }, (_, index) => start + index))
  }
  bingosIndex = bingosIndex.concat(horizontal)
  // Vertical
  const vertical = Array(edgeL)
    .fill(Array(edgeL).fill(0))
    .map((row, rowI) => row.map((_, colI) => colI * edgeL + rowI))
  bingosIndex = bingosIndex.concat(vertical)
  // Diagonal
  const RTLB = Array(edgeL)
    .fill(0)
    .map((_, i) => i + i * edgeL)
  const LTRB = Array(edgeL)
    .fill(0)
    .map((_, i) => (i + 1) * (edgeL - 1))
  bingosIndex = bingosIndex.concat([RTLB], [LTRB])
  const lines = bingosIndex.map(bingoLine =>
    bingoLine.map(index => ({
      slug: shuffledBoothList.value[index].slug,
      isBonus: shuffledBoothList.value[index].isBonus
    }))
  )
  const userDeliverers = stamps.value.map(deliverer => deliverer.deliverer)
  return lines.filter(line =>
    line.reduce(
      (pv, stamp) =>
        (userDeliverers.findIndex(
          userDeliver => userDeliver === stamp.slug
        ) > -1
        || stamp.isBonus)
      && pv,
      true
    )
  ).length
})

function onSuccess (token) {
  if (currentScanToken.value !== token) {
    currentScanToken.value = token
    alert.value = false
    apiClient.getBingo(sha1Hex(token))
      .then((res) => {
        if (!res.valid) {
          player.value = {
            nickname: res.user_id,
            token: token
          }
          stamps.value = res.deliverers
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
  currentScanToken.value = ''
  player.value = {
    nickname: '',
    token: ''
  }
  alert.value = false
  alertMessage.value = ''
}

function revokPlayer () {
  if (player.value === undefined) {
    openToast('沒有東西可以註銷，不要亂戳(;´༎ຶД༎ຶ`)')
    return
  }

  revoking.value = true

  apiClient.revokPlayer(player.value.token).then((data) => {
    if (data.successful) {
      player.value.nickname += ' - 已註銷'
    }
  }).catch((err) => {
    console.error(err)
  }).finally(() => {
    revoking.value = false
  })
}

function loadBoothList () {
  apiClient.getBoothList().then((res) => {
    boothList.value = res
  })
}

function loadBingoConfig () {
  apiClient.getBingoConfig().then((res) => {
    bingoConfig.value = res
  })
}

onMounted(() => {
  loadBoothList()
  loadBingoConfig()
})
</script>

<style lang="scss">
#BingoGame {
  [role="bingo-player-item"] {
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
    transition: 0s;
  }
}
</style>
