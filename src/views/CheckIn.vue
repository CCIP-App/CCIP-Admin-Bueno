<template>
  <div id='CheckIn'>
    <v-alert dismissible type="warning" v-model="alert" role="alert" class="mb-3">{{ alertMessage }}</v-alert>
    <v-alert dismissible type="success" v-model="successCI" role="alert" class="mb-3">{{ alertMessage }}</v-alert>
    <v-layout class="mb-3"  row wrap>
      <v-flex xs12 md6>
        <qrcode-reader :enable="qrState" :width="'100%'" :height="'300px'" :noResult="true" @OnSuccess="OnSuccess" />
      </v-flex>
      <v-flex xs12 md6>
        <v-card>
          <!-- <v-card-row class="green darken-1"> -->
            <v-card-title>
            <span class="white--text">CheckIn</span>
            </v-card-title>
          <!-- </v-card-row> -->
          <v-card-text>
            <!-- <v-card-row> -->
              <ul v-if="user.user_id" role="userStatus">
                <li>Nickname: {{ user.user_id }}</li>
                <li>App Login: {{ user.first_use ? user.first_use : 'Not yet' }}</li>
                <li>User Type: {{ user.type }}</li>
                <template v-for="(scenarios, index) in user.scenarios">
                  <li :key="index">
                    {{ scenarios.key + ": " + (scenarios.used ? scenarios.used : 'Not yet') }}
                    <ul v-if="Object.keys(scenarios.attr).length > 0">
                      <li v-for="(key, index) in Object.keys(scenarios.attr)" :key="index">{{ key + ": " + scenarios.attr[key] }}</li>
                    </ul>
                  </li>
                </template>
              </ul>
            <!-- </v-card-row> -->
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
    <v-card class="mb-3">
      <!-- <v-card-row class="green darken-1"> -->
        <v-card-title>
        <span class="white--text">手動輸入 KKTIX Token </span>
        </v-card-title>
      <!-- </v-card-row> -->
      <v-card-text>
        <v-text-field label="Token" v-model="token"></v-text-field>
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

      let today = (new Date()).getTime()
      let day1 = Date.parse('2018/08/11')
      let day2 = Date.parse('2018/08/12')
      // let checkInFunction = apiClient.checkIn
      let checkInFunction = today >= day1 && today < day2 ? apiClient.day1CheckIn : today >= day2 ? apiClient.day2CheckIn : apiClient.checkIn
      checkInFunction(this.token).then((res) => {
        this.updateUserData(res)
        this.successCI = true
        this.alertMessage = res.user_id + ' 報到成功'
      }).catch((err) => {
        if (err.response) {
          if ('link expired/not available now'.match(err.response.data.message)) {
            this.alertMessage = '還沒開始報到喔(╯°□°）╯︵ ┻━┻'
          } else if ('has been used'.match(err.response.data.message)) {
            this.alertMessage = '已經報到過了╮(￣▽￣"")╭'
          } else {
            this.alertMessage = err.response.status + ' - ' + err.response.data.message
          }
        } else {
          this.alertMessage = '網路壞了'
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
          this.alertMessage = '網路壞了'
        }
        this.alert = true
      })
    },
    updateUserData(data) {
      this.user = {
        user_id: data.user_id,
        first_use: data.first_use ? new Date(data.first_use * 1000).toLocaleString() : null,
        type: data.type,
        scenarios: data.scenarios.map((el) => ({
          key: el.display_text['zh-TW'],
          used: el.used ? new Date(el.used * 1000).toLocaleString() : null,
          attr: el.attr
        }))
      }
    }
  }
}
</script>

<style lang="stylus">
  [role="userStatus"]
    font-size: 1.2rem
</style>
