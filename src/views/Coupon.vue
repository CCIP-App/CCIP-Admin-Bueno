<template>
  <div id="Coupon">
    <v-alert dismissible type="warning" v-model="alert" role="alert" class="mb-3">{{ alertMessage }}</v-alert>
    <v-layout>
      <v-flex xs12 md5>
        <qrcode-reader class="mr-3 mt-2 mb-3" :enable="qrState" :width="'32vw'" :height="'24vw'" :noResult="true" @OnSuccess="onSuccess" @OnError="onError" />
      </v-flex>
      <v-flex xs12 md7>
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
            <v-btn class="lighten-2 white--text mr-2" info v-on:click.native="clearUser">Clear User</v-btn>
            <v-btn class="lighten-2 white--text" error :loading="revoking" :disabled="revoking" v-on:click.native="revokCoupon">Revoke Coupon</v-btn>
          </v-card-row>
        </v-card>
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
import apiClient from '../module/apiClient'
import sha1 from 'hash.js/lib/hash/sha/1'
export default {
  name: 'Coupon',
  data () {
    return {
      qrState: true,
      revoking: false,
      alert: false,
      alertMessage: '',
      user: null,
      token: '',
      couponValid: false
    }
  },
  computed: {
  },
  methods: {
    onSuccess (token) {
      token = this.sha1Gen(token)
      if (this.token !== token) {
        this.token = token
        apiClient.getPuzzle(this.token).then((data) => {
          this.user = {
            clearPuzzle: data.valid ? '已於 ' + new Date(data.valid * 1000).toLocaleString() + ' 完成程式碼拼圖' : '尚未完成程式碼拼圖',
            coupon: data.coupon ? '已於 ' + new Date(data.valid * 1000).toLocaleString() + ' 使用' : '尚未使用',
            nickname: data.user_id
          }
          this.couponValid = data.valid !== null && data.coupon === 0
        })
      }
    },
    onError (err) {
      console.log(err)
    },
    sha1Gen (raw) {
      const hashGen = sha1()
      hashGen.update(raw)
      return hashGen.digest('hex')
    },
    clearUser () {
      this.user = null
      this.token = ''
      this.$vuetify.toast.create(...['已經清除了(⊙ω⊙)', 'bottom'])
    },
    revokCoupon () {
      var self = this
      if (this.user !== null) {
        apiClient.revokeCoupon()
          .then(() => {
            self.$vuetify.toast.create(...['Coupon 已經被註銷囉↖(^ω^)↗', 'bottom'])
          })
          .catch((err) => {
            console.error(err)
            self.$vuetify.toast.create(...['發生錯誤(╯°□°）╯︵ ┻━┻', 'bottom'])
          })
      } else {
        self.$vuetify.toast.create(...['沒有東西可以註銷，不要亂戳(;´༎ຶД༎ຶ`)', 'bottom'])
      }
    }
  },
  mounted () {
  },
  watch: {
    user () {
      if (this.couponValid === false) {
        this.$vuetify.toast.create(...['這傢伙不可以折扣(;´༎ຶД༎ຶ`)', 'bottom'])
        this.alertMessage = '這傢伙不可以折扣(;´༎ຶД༎ຶ`)'
        this.alert = !this.couponValid
      }
    }
  }
}
</script>

<style lang="stylus">
  [role="chips"]
    flex-wrap: wrap;
    display: flex;
  [role="puzzle-player-item"]
    font-size: 2rem
  [role="alert"]
    font-size: 1.5rem
    padding: 0.7em
  [role="refresh"]
    display: block
    text-align: center
</style>
