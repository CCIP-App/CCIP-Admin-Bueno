<template>
  <div id="Bingo">
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
            <v-card-text>
              <h2>{{ player.nickname }}</h2><br>
              <h2 v-show="player.token !== ''">{{ `已達成 ${countBingos} 連線` }}</h2>
              <SquareGrid v-show="player.token !== ''" style="width: 80%" :booths="shuffledBoothList" :userStamps="stamps" :showAnchor="true" />
            </v-card-text>
            <v-card-actions>
              <v-btn class="mr-2" color="primary" v-on:click.native="clearPlayer">Clear User</v-btn>
              <v-btn color="error" :loading="revoking" :disabled="revoking" v-on:click.native="revokPlayer">Revoke player</v-btn>
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
import bingoShuffler from '@/utils/shuffledBingo.js'
import SquareGrid from '@/components/SquareGrid.vue'
import _ from 'lodash'

export default {
  name: 'Bingo',
  components: {
    SquareGrid
  },
  data () {
    return {
      qrState: true,
      player: {
        nickname: '',
        token: ''
      },
      stamps: [],
      alert: false,
      alertMessage: '',
      currentScanToken: '',
      revoking: false,
      boothList: [],
      puzzleConfig: {
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
  computed: {
    shuffledBoothList () {
      if (this.puzzleConfig.booths.length === 0) return []

      const shuffled = bingoShuffler(this.puzzleConfig.bingoPattern)(
        this.player.token || '',
        this.puzzleConfig.booths.map(booth => ({
          ...booth,
          displayText: booth.displayText['zh-TW']
        }))
      )
      return shuffled
    },
    countBingos () {
      const itemNum = this.shuffledBoothList.length
      const edgeL = Math.ceil(Math.sqrt(itemNum, 2))
      let bingosIndex = []
      // Horizontal
      const horizontal = _.chunk(
        Array(itemNum)
          .fill(0)
          .map((_, i) => i),
        edgeL
      )
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
          slug: this.shuffledBoothList[index].slug,
          isBonus: this.shuffledBoothList[index].isBonus
        }))
      )
      const userDeliverers = this.stamps.map(deliverer => deliverer.deliverer)
      return lines.filter(line =>
        line.reduce(
          (pv, stamp) =>
            (userDeliverers.findIndex(
              userDeliver => userDeliver === stamp.slug
            ) > -1 ||
              stamp.isBonus) &&
            pv,
          true
        )
      ).length
    }
  },
  methods: {
    onSuccess (token) {
      if (this.currentScanToken !== token) {
        this.currentScanToken = token
        this.alert = false
        apiClient.getPuzzle(this.sha1Gen(token))
          .then((res) => {
            if (!res.valid) {
              this.player = {
                nickname: res.user_id,
                token: token
              }
              this.stamps = res.deliverers
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
      let hashGen = sha1()
      hashGen.update(raw)
      return hashGen.digest('hex')
    },
    clearPlayer () {
      this.openToast('玩家清單已經被清空(⊙ω⊙)')
      this.currentScanToken = ''
      this.player = {
        nickname: '',
        token: ''
      }
      this.alert = false
      this.alertMessage = ''
    },
    revokPlayer () {
      if (this.player === undefined) {
        this.openToast('沒有東西可以註銷，不要亂戳(;´༎ຶД༎ຶ`)')
        return
      }

      this.revoking = this.loader = true

      apiClient.revokPlayer(this.player.token).then((data) => {
        if (data.successful) {
          this.player.nickname += ' - 已註銷'
        }
      }).catch((err) => {
        console.error(err)
      }).finally(() => {
        this.revoking = false
      })
    },
    loadBoothList () {
      apiClient.getBoothList().then((res) => {
        this.boothList = res
      })
    },
    loadPuzzleConfig () {
      apiClient.getPuzzleConfig().then((res) => {
        this.puzzleConfig = res
      })
    }
  },
  mounted () {
    this.loadBoothList()
    this.loadPuzzleConfig()
  }
}
</script>

<style lang="stylus">
  #Bingo
    [role="puzzle-player-item"]
      font-size: 2rem
      margin 5px
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
