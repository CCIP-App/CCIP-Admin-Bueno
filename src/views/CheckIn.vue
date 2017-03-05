<template>
  <div id='CheckIn'>
    <v-alert dismissible warning v-model="alert" role="alert" class="mb-3">{{ alertMessage }}</v-alert>
    <v-alert dismissible success v-model="successCI" role="alert" class="mb-3">{{ alertMessage }}</v-alert>
    <v-row class="mb-3">
      <v-col xs12 md5>
        <qrcode-reader :enable="qrState" class="mr-3 mt-2 mb-3" :width="'32vw'" :height="'24vw'" :noResult="true" @OnSuccess="OnSuccess" />
      </v-col>
      <v-col xs12 md7>
        <v-card>
          <v-card-row class="green darken-1">
            <v-card-title>
            <span class="white--text">CheckIn</span>
            </v-card-title>
          </v-card-row>
          <v-card-text>
            <v-card-row>
              <ul>
                <li v-for="key in Object.keys(user)" role="userStatus">{{ key + ": " + user[key] }}</li>
              </ul>
            </v-card-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-card class="mb-3">
      <v-card-row class="green darken-1">
        <v-card-title>
        <span class="white--text">手動輸入 KKTIX Token </span>
        </v-card-title>
      </v-card-row>
      <v-card-text>
        <v-text-input label="Token" v-model="token"></v-text-input>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import apiClient from '../modal/apiClient'
export default {
  name: 'CheckIn',
  data() {
    return {
      qrState: true,
      token: '',
      alert: false,
      successCI: false,
      alertMessage: '',
      user: {}
    }
  },
  watch: {
    token() {
      if (this.token.length < 32) return
      this.user = {}
      this.alert = this.successCI = false
      apiClient.checkIn(this.token).then((res) => {
        this.updateUserData(res)
        this.successCI = true
        this.alertMessage = res.user_id + ' 報到成功'
      }).catch((err) => {
        if (err.response) {
          this.alertMessage = err.response.status + ' - ' + err.response.data.message
        } else {
          this.alertMessage = 'Something error on network'
        }
        this.alert = true
        this.getStatus(this.token)
      })
    }
  },
  methods: {
    OnSuccess(token) {
      this.token = token
    },
    getStatus(token) {
      apiClient.getStatus(token).then((res) => {
        this.updateUserData(res)
      }).catch((err) => {
        if (err.response) {
          this.alertMessage = err.response.status + ' - ' + err.response.data.message
        } else {
          this.alertMessage = 'Something error on network'
        }
        this.alert = true
      })
    },
    updateUserData(data) {
      const checkin = data.scenarios.find((el) => el.id === 'day1checkin')
      const kit = data.scenarios.find((el) => el.id === 'kit')
      const lunch = data.scenarios.find((el) => el.id === 'day1lunch')
      const vipKit = data.scenarios.find((el) => el.id === 'vipkit')
      this.user = {
        nickname: data.user_id,
        checkinOn: checkin.used ? new Date(checkin.used * 1000).toLocaleString() : '尚未報到',
        type: data.type,
        kit: kit.used ? '已領取' : '尚未領取',
        lunch: lunch.used ? lunch.attr.diet + ' - 已領取' : lunch.disabled ? lunch.attr.diet + ' - 採用人工報到(請查驗 Badge)' : lunch.attr.diet + ' - 尚未領取',
        vipKit: vipKit.disabled ? vipKit.disabled : vipKit.attr.toString() + vipKit.used ? ' - 已領取' : ' - 尚未領取'
      }
    }
  }
}
</script>

<style lang="stylus">
  [role="userStatus"]
    font-size: 1.2rem
</style>
