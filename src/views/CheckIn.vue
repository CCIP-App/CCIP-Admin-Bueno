<template>
  <div id='CheckIn'>
    <v-snackbar
      v-model="alert"
      color="primary"
      :multi-line="true"
      :timeout="5000"
      :top="true"
    >
      <v-alert type="warning" v-model="alert" prominent role="alert" class="pa-3">{{ alertMessage }}</v-alert>
      <v-alert type="success" v-model="successCI" role="alert" class="pa-3">{{ alertMessage }}</v-alert>
      <v-btn
        dark
        text
        @click="alert = false"
      >
        Close
      </v-btn>
    </v-snackbar>
    <v-select
      :items="checkInItems"
      label="選擇報到方法"
      solo
      v-model="nowFunc"
    ></v-select>
    <v-layout class="mb-3" row wrap>
      <v-flex xs12 md4>
        <qrcode-reader :enable="qrState" :width="'100%'" :height="'300px'" :noResult="true" @OnSuccess="OnQRCodeScanSuccess" />
      </v-flex>
      <v-flex xs12 md6>
        <v-card>
          <v-card-text>
            <ul v-if="user.user_id" role="userStatus">
              <li>Nickname: <span class="user_info">{{ user.user_id }}</span></li>
              <li>App login: <span class="user_info">{{ user.first_use ? user.first_use : 'Not yet' }}</span></li>
              <template v-for="(scenarios, index) in sortScenarios(this.scenario, user.scenarios)">
                <li :key="index">
                  {{ scenarios.key }}:
                  <span class="user_info disabled" v-if="scenarios.disabled">{{ scenarios.disabled }}</span>
                  <span class="user_info" v-if="!scenarios.disabled">{{ (scenarios.used ? scenarios.used : 'Not yet') }}</span>
                  <ul v-if="Object.keys(scenarios.attr).length > 0">
                    <li v-for="(key, index) in Object.keys(scenarios.attr)" :key="index">
                      {{ key }}: <span class="user_info">{{ scenarios.attr[key] }}</span>
                    </li>
                  </ul>
                </li>
                <hr v-if="index === 0" :key="'hr_'+index" class="datahr" >
              </template>
            </ul>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
    <v-card class="mb-3">
      <v-card-title>手動輸入 Token</v-card-title>
      <v-card-text>
        <v-text-field label="Token" v-model="token" @keyup="useTokenByKeyUp"></v-text-field>
      </v-card-text>
      <v-card-actions>
        <v-btn class="mr-2" color="primary" v-on:click.native="useToken">手動 checkIn</v-btn>
      </v-card-actions>
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
      user: {},
      scenario: ''
    }
  },
  watch: {
    nowFunc (newFunc, _) {
      this.scenario = this.nowFunc.split('-').pop().trim()
      this.user = {}
      this.token = ''
      this.lastToken = ''
    }
  },
  methods: {
    useTokenByKeyUp (event) {
      if (event.key.toLowerCase() === 'enter') {
        this.useToken()
      }
    },
    useToken () {
      if (this.lastToken === this.token && (this.lastToken + this.token).length > 0) {
        // if (this.nowFunc.length > 0) {
        //   this.alertMessage = '你重複掃太久了，請移開 QR Code'
        //   this.alert = true
        // }
        return
      }

      if (this.nowFunc === '') {
        this.alertMessage = '請選擇要報到的方法'
        this.alert = true
        return
      }
      this.lastToken = this.token

      this.user = {}
      this.alert = this.successCI = false

      apiClient.useScenarios(this.scenario, this.token).then((res) => {
        this.updateUserData(res)
        this.successCI = true
        this.alertMessage = res.user_id + ' 報到成功'
      }).catch((err) => {
        if (err.response) {
          if ('link expired/not available now'.match(err.response.data.message)) {
            this.alertMessage = '還沒開始'
          } else if ('has been used'.match(err.response.data.message)) {
            this.alertMessage = '已經報到過了'
          } else {
            this.alertMessage = err.response.status + ' - ' + err.response.data.message
          }
        } else {
          this.alertMessage = '網路壞了'
        }
        this.alert = true
        this.getStatus(this.token)
      })
    },
    OnQRCodeScanSuccess (token) {
      this.token = token
      this.useToken()
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
          _raw: el,
          id: el.id,
          order: el.order,
          disabled: el.disabled,
          key: el.display_text['zh-TW'],
          used: el.used ? new Date(el.used * 1000).toLocaleString() : null,
          attr: el.attr
        }))
      }
    },
    sortScenarios (scenario, scenarios) {
      let first = scenarios.filter((s) => s.id === scenario)
      let nonFirst = scenarios.filter((s) => s.id !== scenario)
      let sorted = first.concat(nonFirst)
      return sorted
    }
  },
  mounted () {
    (async () => {
      const data = (await Promise.all(
        (await apiClient.getRoles()).map(async (role) => {
          return {
            role: role,
            scenarios: await apiClient.allScenarios(role)
          }
        })
      )).map((r) => r.scenarios.map((s) => `${r.role} - ${s}`)).flat()
      this.checkInItems = data
    })()
  }
}
</script>

<style lang="stylus">
  [role="userStatus"] {
    font-size: 1.2rem;

    & .user_info {
      color: #4d256f;
      font-weight: bold;

      &.disabled {
        color: orange;
      }
    }

    & .datahr {
      border: solid black 2px;
      margin-top: 10px;
      margin-bottom: 15px;
    }
  }

  .v-select .v-text-field__details {
    display: none;
  }
</style>
