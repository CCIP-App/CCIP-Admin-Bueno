<template>
  <div id="Puzzle">
    <v-layout>
      <v-flex xs12 md5>
        <qrcode-reader class="mr-3 mt-2 mb-3" :enable="qrState" :width="'32vw'" :height="'24vw'" :noResult="true" @OnSuccess="onSuccess" @OnError="onError" />
      </v-flex>
      <v-flex xs12 md7>
        <v-alert dismissible warning v-model="alert" role="alert">{{ alertMessage }}</v-alert>
        <v-card>
          <v-card-text>
            <p>請工作人員核對玩家手機顯示的連線數，發指定的獎品給玩家，掃描玩家 Qr Code，並按下兌換！<br>注意：玩家只能兌換一次！</p>
            <ol>
              <li>三條：折 20</li>
              <li>五條：刺繡布章</li>
              <li>七條：鑰匙圈</li>
              <li>十條以上：大禮包 (鑰匙圈、提袋、刺繡布章) </li>
            </ol>
            <ul>
              <li v-for="(player, index) in players" role="puzzle-player-item" :key="index">{{ player.nickname }}</li>
            </ul>
          </v-card-text>
          <v-card-actions>
            <v-btn
              color="primary"
              text
              dark v-on:click.native="clearPlayer">清除使用者</v-btn>
            <v-btn
              color="primary"
              text
              dark
              :loading="revoking" :disabled="revoking" v-on:click.native="revokPlayer">兌換</v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
import apiClient from '../module/apiClient'
import sha1 from 'hash.js/lib/hash/sha/1'
export default {
  name: 'ArrayGame',
  data () {
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
    onSuccess (token) {
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
              this.alertMessage = '玩家已經被兌換過了！'
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
    onError (err) {
      console.log(err)
    },
    sha1Gen (raw) {
      let hashGen = sha1()
      hashGen.update(raw)
      return hashGen.digest('hex')
    },
    clearPlayer () {
      window.alert('玩家清單已經被清空(⊙ω⊙)')
      this.currentScanToken = ''
      this.players = []
      this.tokens = []
      this.alert = false
      this.alertMessage = ''
    },
    revokPlayer () {
      if (this.tokens.length === 0) {
        window.alert('沒有東西可以註銷，不要亂戳(;´༎ຶД༎ຶ`)')
        return
      }

      // if (this.players.filter((el) => el.clear).length === 0) {
      //   window.alert('沒有完成大地遊戲的玩家喔！')
      //   return
      // }
      this.revoking = true
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
    }
  },
  mounted () {
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
