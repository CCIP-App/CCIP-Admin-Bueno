<template>
  <div id='PushNoti'>
    <v-container fluid>
      <v-layout>
        <v-flex xs12 md12 style="margin: 0 auto;">
          <v-card style="margin: 0 auto;">
            <v-card-text class=" text-xs-center">
              <h5 class="ma-0">新增推播通知</h5>
              <v-select v-bind:items="options" placeholder="選擇對象" v-model.number="feed.to" :disabled="disabled"></v-select>
              <v-text-field type="text" placeholder="Msg(zh)" v-model="feed.msg_zh" :disabled="disabled"></v-text-field>
              <v-text-field type="text" placeholder="Msg(en)" v-model="feed.msg_en" :disabled="disabled"></v-text-field>
              <v-text-field type="text" placeholder="URI(option)" v-model="feed.uri" :disabled="disabled"></v-text-field>
              <v-btn ripple info @click.native="send" :disabled="disabled" :loading="disabled">Send!</v-btn>
            </v-card-text>
          </v-card>
        </v-flex>
      </v-layout>
      <v-alert dismissible warning v-model="alert" role="alert">{{ alertMessage }}</v-alert>
      <v-alert dismissible success v-model="success" role="alert">推播成功</v-alert>

    </v-container>
  </div>
</template>

<script>
import apiClient from '../module/apiClient'
import oneSignal from '../module/onesignal'
export default {
  name: 'PushNoti',
  data () {
    return {
      options: [],
      feed: {
        to: 0,
        msg_en: '',
        msg_zh: '',
        uri: ''
      },
      disabled: false,
      alert: false,
      success: false,
      alertMessage: ''
    }
  },
  mounted() {
    let self = this
    apiClient.getRoles().then((res) => {
      self.options = [
      {
        value: 'all',
        text: '全體'
      }
    ].concat(res.map((r) => { return { value: r, text: r } }))
    })
  },
  methods: {
    send () {
      this.alert = false
      this.success = false
      let packet = {
        target: this.feed.to,
        en: this.feed.msg_en,
        'zh-Hant': this.feed.msg_zh,
        'zh-Hans': this.feed.msg_zh
      }
      if (this.feed.uri.length > 0) packet['uri'] = this.feed.uri
      if (this.feed.msg_en.length > 0 && this.feed.msg_zh.length > 0 && this.feed.to !== 0) {
        oneSignal.createNotificationWithTagFilter(packet)
          .then((res) => {
            this.success = true
          })
          .catch((err) => {
            console.log(err)
            this.alertMessage = 'Something error on network'
            this.alert = true
          })
      } else {
        this.alertMessage = '欄位不完整'
        this.alert = true
      }
    }
  }
}

</script>

<style scoped>

</style>
