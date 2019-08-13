<template>
  <div id='CheckIn'>
    <v-alert dismissible type="warning" v-model="alert" role="alert" class="mb-3">{{ alertMessage }}</v-alert>
    <v-alert dismissible type="success" v-model="successCI" role="alert" class="mb-3">{{ alertMessage }}</v-alert>
    <v-select
      :items="checkInItems"
      label="選擇報到方法"
      solo
      v-model="nowFunc"
    ></v-select>
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
                <li>App login: {{ user.first_use ? user.first_use : 'Not yet' }}</li>
                <li>User role: {{ user.role }}</li>
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
import apiClient from '../module/apiClient'
export default {
  name: 'CheckIn',
  data () {
    return {
      checkInItems: [],
      nowFunc: '',
      qrState: true,
      token: '',
      lastToken: '',
      alert: false,
      successCI: false,
      alertMessage: '',
      user: {}
    }
  },
  watch: {
    lastToken (newVal, _) {
      if (newVal.length > 0) {
        setTimeout(() => {
          this.lastToken = ''
        }, 500)
      }
    }
  },
  methods: {
    OnSuccess (token) {
      this.token = token

      if (this.lastToken === this.token) return

      this.user = {}
      this.alert = this.successCI = false

      if (this.nowFunc === '') {
        this.alertMessage = '請選擇要報到的方法'
        this.alert = true
        return
      }
      apiClient.useScenarios(this.nowFunc.split('-').pop().trim(), this.token).then((res) => {
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
      }).finally(() => {
        this.lastToken = this.token
      })
    },
    getStatus (token) {
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
    updateUserData (data) {
      this.user = {
        user_id: data.user_id,
        first_use: data.first_use ? new Date(data.first_use * 1000).toLocaleString() : null,
        role: data.role,
        scenarios: data.scenarios.map((el) => ({
          key: el.display_text['zh-TW'],
          used: el.used ? new Date(el.used * 1000).toLocaleString() : null,
          attr: el.attr
        }))
      }
    }
  },
  async mounted () {
    const data = (await Promise.all(
      (await apiClient.getRoles()).map(async (role) => {
        return {
          role: role,
          scenarios: await apiClient.allScenarios(role)
        }
      })
    )).map((r) => r.scenarios.map((s) => `${r.role} - ${s}`)).flat()
    this.checkInItems = data
  }
}
</script>

<style lang="stylus">
  [role="userStatus"]
    font-size: 1.2rem
</style>
