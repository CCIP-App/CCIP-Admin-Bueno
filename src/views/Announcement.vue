<template>
  <div id='Announcement'>
    <v-container fluid>
      <v-row>
        <v-col :xs="12" :md="12" style="margin: 0 auto;">
          <v-card style="margin: 0 auto;">
            <v-card-text class=" text-xs-center">
              <h5 class="ma-0">新增大會公告</h5>
              <v-select :items="options" placeholder="選擇對象" v-model.number="newAnnounce.role" :disabled="disabled"></v-select>
              <v-text-field type="text" placeholder="Msg(zh)" v-model="newAnnounce.msg_zh" :disabled="disabled"></v-text-field>
              <v-text-field type="text" placeholder="Msg(en)" v-model="newAnnounce.msg_en" :disabled="disabled"></v-text-field>
              <v-text-field type="text" placeholder="URI(optional)" v-model="newAnnounce.uri" :disabled="disabled"></v-text-field>
              <v-btn ripple info @click="send" :disabled="disabled" :loading="disabled">Send!</v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      <br>
      <v-alert dismissible type="warning" v-model="alert" role="alert">{{ alertMessage }}</v-alert>
      <v-row>
        <v-col :xs="12" :md="12" style="margin: 0 auto;">
          <v-card style="margin: 0 auto;">
            <v-card-text class=" text-xs-center">
              <h5 class="ma-0">大會公告歷程</h5>
              <v-table v-if="announcements.length!=0">
                <thead>
                  <tr>
                    <th v-for="(header,index) in headers" v-text="header" :key="'header'+index"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in announcements" :key="'item'+index">
                    <td>{{ formatDatetime(item.datetime) }}</td>
                    <td>{{ item.role?.join(', ') ?? '' }}</td>
                    <td>{{ item.msg_zh }}</td>
                    <td>{{ item.msg_en }}</td>
                    <td>{{ item.uri }}</td>
                  </tr>
                </tbody>
              </v-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import apiClient from '../module/apiClient'

export default {
  name: 'Announcement',
  data () {
    return {
      options: [],
      newAnnounce: {
        role: '',
        msg_zh: '',
        msg_en: '',
        uri: ''
      },
      disabled: false,
      headers: ['公告時間', '發送對象', '中文訊息', '英文訊息', '網址'],
      announcements: [],
      alert: false,
      alertMessage: ''
    }
  },
  methods: {
    send () {
      this.disabled = true
      this.alert = false
      if (this.newAnnounce.msg_en.length > 0) {
        apiClient.addAnnouncement(this.newAnnounce)
          .then((res) => {
            if (res.status === 'OK') {
              this.newAnnounce.datetime = new Date().getTime() / 1000
              this.announcements.unshift(this.newAnnounce)
              this.newAnnounce = {
                role: '',
                msg_zh: '',
                msg_en: '',
                uri: ''
              }
            }
            return this.announcements[0]
          })
          .catch((err) => {
            console.log(err)
            this.alertMessage = 'Something error on network'
            this.alert = true
          })
          .then(() => {
            this.disabled = false
          })
      } else {
        this.alert = true
        this.alertMessage = '至少需輸入英文'
      }
    },
    formatDatetime (time) {
      const datetime = new Date(time * 1000)
      return this.leftpad(datetime.getMonth() + 1, 2) + '/' + this.leftpad(datetime.getDate(), 2) + ' ' +
          this.leftpad(datetime.getHours(), 2) + ':' + this.leftpad(datetime.getMinutes(), 2)
    },
    leftpad (number, targetLength) {
      let output = number + ''
      while (output.length < targetLength) {
        output = '0' + output
      }
      return output
    }
  },
  mounted () {
    const self = this
    apiClient.getRoles().then((res) => {
      self.options = [
        {
          value: '',
          title: '全體'
        }
      ].concat(res.map((r) => { return { value: [r], title: r } }))
      self.options[0].value = self.options.slice(1).map(o => o.value).flat()
    })
    apiClient.getAnnouncement()
      .then((Announcements) => {
        this.announcements = Announcements
      })
      .catch((err) => {
        console.log(err, err.config)
      })
  }
}

</script>
