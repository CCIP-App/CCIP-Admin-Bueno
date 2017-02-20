<template>
  <div id="Puzzle">
    <v-row>
      <v-col xs12 md5>
        <qrcode-reader class="mr-3 mt-2" :enable="qrState" :width="'100%'" :height="'75%'" :noResult="true" @OnSuccess="onSuccess" @OnError="onError" />
      </v-col>
      <v-col xs12 md7>
        <v-card>
          <v-card-row  class="green darken-1">
            <v-card-title>
              <span class="white--text">Player</span>
            </v-card-title>
          </v-card-row>
          <v-card-text>
            <v-card-row>
              <ul>
                <li v-for="player in players">{{ player.nickname }} ({{ player.token }})</li>
              </ul>
            </v-card-row>
          </v-card-text>
          <v-card-row actions>
            <v-btn class="teal lighten-2 white--text">Compiled Successfully (Revoke those of player)</v-btn>
          </v-card-row>
        </v-card>
      </v-col>
    </v-row>
    <div class="mt-3" role="puzzle-debugger">
      <v-card>
        <v-card-row class="green darken-1">
          <v-card-title>
          <span class="white--text">Puzzle Chip</span>
          </v-card-title>
        </v-card-row>
        <v-card-row>
          <v-card-text>
          </v-card-text>
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
      players: [
        {
          nickname: 'nickname',
          token: '123232'
        },
        {
          nickname: 'nickname',
          token: '123232'
        },
        {
          nickname: 'nickname',
          token: '123232'
        },
        {
          nickname: 'nickname',
          token: '123232'
        }
      ],
      chips: [],
      tokens: []
    }
  },
  methods: {
    onSuccess(token) {
      if (this.tokens.indexOf(token) < 0) {
        this.tokens.push(token)
        apiClient.getNickname(token)
          .then((res) => {
            this.players.push({
              nickname: res.nickname,
              token: token
            })
          }, (err) => {
            console.error(err)
          })
        apiClient.getPuzzle(this.sha1Gen(token))
          .then((res) => {
            this.chips.push(res)
          }, (err) => {
            console.error(err)
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
    }
  },
  mounted() {
  }
}
</script>

<style lang="stylus">
</style>
