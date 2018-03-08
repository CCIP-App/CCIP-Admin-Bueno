<template>
  <div id="KingGame">
    <v-layout row wrap>
      <v-flex xs12 md6>
        <qrcode-reader class="mr-3 mt-2 mb-3" :enable="qrState" :width="'45vw'" :height="'45vw'" :noResult="true" @OnSuccess="onSuccess" @OnError="onError" />
      </v-flex>
      <v-flex xs12 md6>
        <v-alert dismissible warning v-model="alert" role="alert">{{ alertMessage }}</v-alert>
        <v-card>
          <v-card-title>
            <span>知識王</span>
          </v-card-title>
          <v-card-text>
            <ul v-if="user.nick !== ''" role="userStatus">
              <li>Nickname: {{ user.nick }}</li>
              <li>High Score: {{ user.score }}</li>
              <li>Score: {{ user.score - user.cost }}</li>
              <li>兌換過：</li>
              <ul v-if="user.prizes.length > 0">
                <li  v-for="(prize, index) in user.prizes" :key="index">{{ prize.name }}</li>
              </ul>
            </ul>
          </v-card-text>
        </v-card>
      </v-flex>
      <v-flex xs12 md12>
        <v-data-table
          :headers="headers"
          :items="prizes"
          hide-actions
          class="elevation-1">
          <template slot="items" slot-scope="props">
            <td>{{ props.item.id }}</td>
            <td>{{ props.item.name }}</td>
            <td>{{ props.item.needScore }}</td>
            <td>{{ props.item.convertTime }}</td>
            <td><v-btn color="blue" dark @click="convert(props.item.id)">兌換</v-btn></td>
          </template>
        </v-data-table>
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
import kingApi from '../modal/kingApi.js'
export default {
  name: 'KingGame',
  data() {
    return {
      qrState: true,
      token: '',
      user: {
        nick: '',
        score: 0,
        cost: 0,
        prizes: []
      },
      alert: false,
      alertMessage: '',
      headers: [{
            text: 'id',
            align: 'left',
            value: 'id'
          },
          { text: '名稱', value: 'name' },
          { text: '兌換分數', value: 'needScore' },
          { text: '已兌換獎品數', value: 'convertTime' },
          { text: '操作區', value: 'doing' }],
      prizes: []
    }
  },
  methods: {
    onSuccess(token) {
      this.token = token
      this.loadUser()
    },
    onError(err) {
      console.log(err)
    },
    loadUser () {
      kingApi.getUser(this.token)
        .then((res) => {
          this.user.nick = res.data.nick
          this.user.score = res.data.score
          this.user.cost = res.data.cost
          this.user.prizes = res.data.prizes
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
    },
    loadPrizes() {
      kingApi.getPrizes().then((res) => {
        this.prizes = res.data
      }).catch((err) => {
        // Show dialog: show request err
          if (err.response) {
            this.alertMessage = err.response.status + ' - ' + err.response.data.message
          } else {
            this.alertMessage = 'Something error on network'
          }
          this.alert = true
      })
    },
    convert(id) {
      if(window.confirm('確定要兌換？')) {
        kingApi.convert(id, this.token).then((res) => {
          window.alert(((res.data.status!=='error')?'兌換成功':'兌換失敗'))
          this.loadUser()
        }).catch((err) => {
          // Show dialog: show request err
            if (err.response) {
              this.alertMessage = err.response.status + ' - ' + err.response.data.message
            } else {
              this.alertMessage = 'Something error on network'
            }
            this.alert = true
        })
      }
    }
  },
  mounted() {
    this.loadPrizes()
  }
}
</script>

<style lang="stylus">
  [role="userStatus"]
    font-size: 1.2rem
</style>
