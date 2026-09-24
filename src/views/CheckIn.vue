<template>
  <div id='CheckIn'>
    <v-snackbar
      v-model="alert"
      color="primary"
      :multi-line="true"
      :timeout="5000"
      location="top"
    >
      <v-alert type="warning" v-model="alert" prominent role="alert" class="pa-3">{{ alertMessage }}</v-alert>
      <v-alert type="success" v-model="successCI" role="alert" class="pa-3">{{ alertMessage }}</v-alert>
      <v-btn
        dark
        variant="text"
        @click="alert = false"
      >
        Close
      </v-btn>
    </v-snackbar>
    <v-select
      :items="checkInItems"
      label="選擇報到方法"
      variant="solo"
      v-model="nowFunc"
    ></v-select>
    <v-row class="mb-3" row wrap>
      <v-col cols="12" :md="4">
        <qrcode-reader :enable="qrState" :width="'100%'" :height="'300px'" :noResult="true" @OnSuccess="OnQRCodeScanSuccess" />
      </v-col>
      <v-col cols="12" :md="6">
        <v-card>
          <v-card-text>
            <ul v-if="user.user_id" role="userStatus">
              <li>Nickname: <span class="user_info">{{ user.user_id }}</span></li>
              <li>App login: <span class="user_info">{{ user.first_use ? user.first_use : 'Not yet' }}</span></li>
              <template v-for="(scenarios, index) in sortScenarios(scenario, user.scenarios)" :key="index">
                <li>
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
      </v-col>
    </v-row>
    <v-card class="mb-3">
      <v-card-title>手動輸入 Token</v-card-title>
      <v-card-text>
        <v-text-field label="Token" v-model="token" @keyup="useTokenByKeyUp"></v-text-field>
      </v-card-text>
      <v-card-actions>
        <v-btn class="mr-2" color="primary" @click="useToken">手動 checkIn</v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import apiClient from '../module/apiClient'
import QrcodeReader from '@/components/QrcodeReader.vue'

const checkInItems = ref([])
const nowFunc = ref('')
const qrState = ref(true)
const token = ref('')
const lastToken = ref('')
const alert = ref(false)
const successCI = ref(false)
const alertMessage = ref('')
const user = ref({})
const scenario = ref('')

watch(nowFunc, (newFunc, _) => {
  scenario.value = nowFunc.value.split('-').pop().trim()
  user.value = {}
  token.value = ''
  lastToken.value = ''
})

function useTokenByKeyUp (event) {
  if (event.key.toLowerCase() === 'enter') {
    useToken()
  }
}

function useToken () {
  if (lastToken.value === token.value && (lastToken.value + token.value).length > 0) {
    // if (nowFunc.value.length > 0) {
    //   alertMessage.value = '你重複掃太久了，請移開 QR Code'
    //   alert.value = true
    // }
    return
  }

  if (nowFunc.value === '') {
    alertMessage.value = '請選擇要報到的方法'
    alert.value = true
    return
  }
  lastToken.value = token.value

  user.value = {}
  alert.value = successCI.value = false

  apiClient.useScenarios(scenario.value, token.value).then((res) => {
    updateUserData(res)
    successCI.value = true
    alertMessage.value = res.user_id + ' 報到成功'
  }).catch((err) => {
    if (err.response) {
      if ('link expired/not available now'.match(err.response.data.message)) {
        alertMessage.value = '還沒開始'
      } else if ('has been used'.match(err.response.data.message)) {
        alertMessage.value = '已經報到過了'
      } else {
        alertMessage.value = err.response.status + ' - ' + err.response.data.message
      }
    } else {
      alertMessage.value = '網路壞了'
    }
    alert.value = true
    getStatus(token.value)
  })
}

function OnQRCodeScanSuccess (newToken) {
  token.value = newToken
  useToken()
}

function getStatus (token) {
  apiClient.getStatus(token).then((res) => {
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
      _raw: el,
      id: el.id,
      order: el.order,
      disabled: el.disabled,
      key: el.display_text['zh-TW'],
      used: el.used ? new Date(el.used * 1000).toLocaleString() : null,
      attr: el.attr
    }))
  }
}

function sortScenarios (scenario, scenarios) {
  const first = scenarios.filter((s) => s.id === scenario)
  const nonFirst = scenarios.filter((s) => s.id !== scenario)
  const sorted = first.concat(nonFirst)
  return sorted
}

onMounted(() => {
  (async () => {
    const data = (await Promise.all(
      (await apiClient.getRoles()).map(async (role) => {
        return {
          role: role,
          scenarios: await apiClient.allScenarios(role)
        }
      })
    )).map((r) => r.scenarios.map((s) => `${r.role} - ${s}`)).flat()
    checkInItems.value = data
  })()
})
</script>

<style lang="scss">
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
