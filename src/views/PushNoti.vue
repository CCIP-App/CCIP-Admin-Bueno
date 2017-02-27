<template>
  <div id='PushNoti'>
    <v-container fluid>
      <v-row>
        <v-col xs12 md12 style="margin: 0 auto;">
          <v-card style="margin: 0 auto;">
            <v-card-text class=" text-xs-center">
              <h5 class="ma-0">新增推播通知</h5>
              <v-select v-bind:options="options" placeholder="選擇對象" v-model.number="feed.to" :disabled="disabled"></v-select>
              <v-text-input type="text" placeholder="Msg" v-model="feed.msg" :disabled="disabled"></v-text-input>
              <v-text-input type="text" placeholder="URI(option)" v-model="feed.uri" :disabled="disabled"></v-text-input>
              <v-btn ripple info @click.native="send" :disabled="disabled" :loading="disabled">Send!</v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      <v-alert dismissible warning v-model="alert" role="alert">{{ alertMessage }}</v-alert>
      <v-alert dismissible success v-model="success" role="alert">推播成功</v-alert>

    </v-container>
  </div>
</template>

<script>
import oneSignal from '../modal/onesignal'
export default {
  name: 'PushNoti',
  data() {
    return {
      options: [
        {
          value: 'All',
          text: '全體'
        }, {
          value: 'Audience',
          text: '僅會眾'
        },
        {
          value: 'Staff',
          text: '僅工作人員'
        },
        {
          value: 'Speaker',
          text: '僅講者'
        }
      ],
      feed: {
        to: 0,
        msg: '',
        uri: ''
      },
      disabled: false,
      alert: false,
      success: false,
      alertMessage: ''
    }
  },
  methods: {
    send() {
      this.alert = false
      this.success = false
      let packet = {
        target: [this.feed.to],
        en: this.feed.msg
      }
      if (this.feed.uri.length > 0) packet['uri'] = this.feed.uri
      if (this.feed.msg.length > 0 && this.feed.to !== 0) {
        oneSignal.createNotification(packet)
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
