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
              <ul v-if="user.user_id" role="userStatus">
                <li>Nickname: {{ user.user_id }}</li>
                <li>App Login: {{ user.first_use ? user.first_use : 'Not yet' }}</li>
                <li>User Type: {{ user.type }}</li>
                <template v-for="scenarios in user.scenarios">
                  <li>
                    {{ scenarios.key + ": " + (scenarios.used ? scenarios.used : 'Not yet') }}
                    <ul v-if="Object.keys(scenarios.attr).length > 0">
                      <li v-for="key in Object.keys(scenarios.attr)">{{ key + ": " + scenarios.attr[key] }}</li>
                    </ul>
                  </li>
                </template>
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
          if ('link expired/not available now'.match(err.response.data.message)) {
            this.alertMessage = '還沒開始報到喔(╯°□°）╯︵ ┻━┻'
          } else if ('has been used'.match(err.response.data.message)) {
            this.alertMessage = '已經報到過了╮(￣▽￣"")╭'
          } else {
            this.alertMessage = err.response.status + ' - ' + err.response.data.message
          }
        } else {
          this.alertMessage = '網路壞了，找線路組o(︶︿︶)o'
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
          this.alertMessage = '網路壞了，找線路組o(︶︿︶)o'
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
