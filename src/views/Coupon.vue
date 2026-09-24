<template>
  <div id="Coupon">
    <v-alert closable type="warning" v-model="alert" role="alert" class="mb-3">{{ alertMessage }}</v-alert>
    <v-row>
      <v-col cols="12" :md="5">
        <qrcode-reader class="mr-3 mt-2 mb-3" :enable="qrState" :width="'32vw'" :height="'24vw'" :noResult="true" @OnSuccess="onSuccess" @OnError="onError" />
      </v-col>
      <v-col cols="12" :md="7">
        <v-card>
          <v-card-row  class="green darken-1">
            <v-card-title>
              <span>User</span>
            </v-card-title>
          </v-card-row>
          <v-card-text>
            <template v-if="user !== null">
              <ul>
                <li>暱稱：{{ user.nickname }}</li>
                <li>程式碼拼圖：{{ user.clearPuzzle }}</li>
                <li>Coupon：{{ user.coupon }}</li>
              </ul>
            </template>
          </v-card-text>
          <v-card-row actions>
            <v-btn class="mr-2" color="info" @click="clearUser">Clear User</v-btn>
            <v-btn class="lighten-2 white--text" color="error" :loading="revoking" :disabled="revoking" @click="revokCoupon">Revoke Coupon</v-btn>
          </v-card-row>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { getCurrentInstance, ref, watch } from 'vue'
import apiClient from '../module/apiClient'
import { sha1Hex } from '@/utils/hash.js'
import QrcodeReader from '@/components/QrcodeReader.vue'

// Keeps the original this.$vuetify calls without changing behavior
const { proxy } = getCurrentInstance()

const qrState = ref(true)
const revoking = ref(false)
const alert = ref(false)
const alertMessage = ref('')
const user = ref(null)
const token = ref('')
const couponValid = ref(false)

function onSuccess (scannedToken) {
  scannedToken = sha1Hex(scannedToken)
  if (token.value !== scannedToken) {
    token.value = scannedToken
    apiClient.getPuzzle(token.value).then((data) => {
      user.value = {
        clearPuzzle: data.valid ? '已於 ' + new Date(data.valid * 1000).toLocaleString() + ' 完成程式碼拼圖' : '尚未完成程式碼拼圖',
        coupon: data.coupon ? '已於 ' + new Date(data.valid * 1000).toLocaleString() + ' 使用' : '尚未使用',
        nickname: data.user_id
      }
      couponValid.value = data.valid !== null && data.coupon === 0
    })
  }
}

function onError (err) {
  console.log(err)
}

function clearUser () {
  user.value = null
  token.value = ''
  proxy.$vuetify.toast.create(...['已經清除了(⊙ω⊙)', 'bottom'])
}

function revokCoupon () {
  if (user.value !== null) {
    apiClient.revokeCoupon()
      .then(() => {
        proxy.$vuetify.toast.create(...['Coupon 已經被註銷囉↖(^ω^)↗', 'bottom'])
      })
      .catch((err) => {
        console.error(err)
        proxy.$vuetify.toast.create(...['發生錯誤(╯°□°）╯︵ ┻━┻', 'bottom'])
      })
  } else {
    proxy.$vuetify.toast.create(...['沒有東西可以註銷，不要亂戳(;´༎ຶД༎ຶ`)', 'bottom'])
  }
}

watch(user, () => {
  if (couponValid.value === false) {
    proxy.$vuetify.toast.create(...['這傢伙不可以折扣(;´༎ຶД༎ຶ`)', 'bottom'])
    alertMessage.value = '這傢伙不可以折扣(;´༎ຶД༎ຶ`)'
    alert.value = !couponValid.value
  }
})
</script>

<style lang="scss">
[role="chips"] {
  flex-wrap: wrap;
  display: flex;
}
[role="puzzle-player-item"] {
  font-size: 2rem;
}
[role="alert"] {
  font-size: 1.5rem;
  padding: 0.7em;
}
[role="refresh"] {
  display: block;
  text-align: center;
}
</style>
