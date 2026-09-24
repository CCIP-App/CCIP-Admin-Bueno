<template>
  <div id='Lunch'>
    <v-alert closable type="warning" v-model="alert" role="alert" class="mb-3">{{ alertMessage }}</v-alert>
    <v-alert closable type="success" v-model="successCI" role="alert" class="mb-3">{{ alertMessage }}</v-alert>
    <v-row row wrap>
      <v-col cols="12" :md="6">
        <qrcode-reader :enable="qrState" :width="'100%'" :height="'300px'" :noResult="true" @OnSuccess="OnSuccess" />
      </v-col>
      <v-col cols="12" :md="6">
        <v-card>
          <!-- <v-card-row class="green darken-1"> -->
            <v-card-title>
            <span class="white--text">Lunch</span>
            </v-card-title>
          <!-- </v-card-row> -->
          <v-card-text>
            <!-- <v-card-row> -->
              <ul v-if="user.user_id" role="userStatus">
                <li>Nickname: {{ user.user_id }}</li>
                <li>App login: {{ user.first_use ? user.first_use : 'Not yet' }}</li>
                <li>User role: {{ user.role }}</li>
                <template v-for="(scenarios, index) in user.scenarios" :key="index">
                  <li>
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
      </v-col>
    </v-row>
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

<script setup>
import { ref, watch } from 'vue'
import apiClient from '../module/apiClient'
import QrcodeReader from '@/components/QrcodeReader.vue'

const qrState = ref(true)
const token = ref('')
const alert = ref(false)
const successCI = ref(false)
const alertMessage = ref('')
const user = ref({})

watch(token, () => {
  if (token.value.length < 32) return
  user.value = {}
  alert.value = successCI.value = false

  // let today = (new Date()).getTime()
  // let day1 = Date.parse('2017/08/05')
  // let day2 = Date.parse('2017/08/06')
  const checkInFunction = apiClient.lunch
  checkInFunction(token.value).then((res) => {
    updateUserData(res)
    successCI.value = true
    alertMessage.value = res.user_id + ' 登記成功'
  }).catch((err) => {
    if (err.response) {
      if ('link expired/not available now'.match(err.response.data.message)) {
        alertMessage.value = '還沒開始登記喔(╯°□°）╯︵ ┻━┻'
      } else if ('has been used'.match(err.response.data.message)) {
        alertMessage.value = '已經登記過了╮(￣▽￣"")╭'
      } else {
        alertMessage.value = err.response.status + ' - ' + err.response.data.message
      }
    } else {
      alertMessage.value = '網路壞了'
    }
    alert.value = true
    getStatus(token.value)
  })
})

function OnSuccess (scannedToken) {
  token.value = scannedToken
}

function getStatus (statusToken) {
  apiClient.getStatus(statusToken).then((res) => {
    updateUserData(res)
  }).catch((err) => {
    if (err.response) {
      alertMessage.value = err.response.status + ' - ' + err.response.data.message
    } else {
      alertMessage.value = '網路壞了'
    }
    alert.value = true
  })
}

function updateUserData (data) {
  user.value = {
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
</script>

<style lang="scss">
[role="userStatus"] {
  font-size: 1.2rem;
}
</style>
