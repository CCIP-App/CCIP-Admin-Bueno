<template>
  <div id='Announcement'>
    <v-container fluid>
      <v-row>
        <v-col cols="12" :md="12" style="margin: 0 auto;">
          <v-card style="margin: 0 auto;">
            <v-card-text>
              <h5 class="ma-0">新增大會公告</h5>
              <v-select :items="options" placeholder="選擇對象" v-model.number="newAnnounce.role" :disabled="disabled"></v-select>
              <v-text-field type="text" placeholder="Msg(zh)" v-model="newAnnounce.msg_zh" :disabled="disabled"></v-text-field>
              <v-text-field type="text" placeholder="Msg(en)" v-model="newAnnounce.msg_en" :disabled="disabled"></v-text-field>
              <v-text-field type="text" placeholder="URI(optional)" v-model="newAnnounce.uri" :disabled="disabled"></v-text-field>
              <v-btn ripple color="info" @click="send" :disabled="disabled" :loading="disabled">Send!</v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      <br>
      <v-alert closable type="warning" v-model="alert" role="alert">{{ alertMessage }}</v-alert>
      <v-row>
        <v-col cols="12" :md="12" style="margin: 0 auto;">
          <v-card style="margin: 0 auto;">
            <v-card-text>
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

<script setup>
import { ref, onMounted } from 'vue'
import apiClient from '../module/apiClient'

const options = ref([])
const newAnnounce = ref({
  role: '',
  msg_zh: '',
  msg_en: '',
  uri: ''
})
const disabled = ref(false)
const headers = ref(['公告時間', '發送對象', '中文訊息', '英文訊息', '網址'])
const announcements = ref([])
const alert = ref(false)
const alertMessage = ref('')

function send () {
  disabled.value = true
  alert.value = false
  if (newAnnounce.value.msg_en.length > 0) {
    apiClient.addAnnouncement(newAnnounce.value)
      .then((res) => {
        if (res.status === 'OK') {
          newAnnounce.value.datetime = new Date().getTime() / 1000
          announcements.value.unshift(newAnnounce.value)
          newAnnounce.value = {
            role: '',
            msg_zh: '',
            msg_en: '',
            uri: ''
          }
        }
        return announcements.value[0]
      })
      .catch((err) => {
        console.log(err)
        alertMessage.value = 'Something error on network'
        alert.value = true
      })
      .then(() => {
        disabled.value = false
      })
  } else {
    alert.value = true
    alertMessage.value = '至少需輸入英文'
  }
}

function formatDatetime (time) {
  const datetime = new Date(time * 1000)
  return leftpad(datetime.getMonth() + 1, 2) + '/' + leftpad(datetime.getDate(), 2) + ' '
    + leftpad(datetime.getHours(), 2) + ':' + leftpad(datetime.getMinutes(), 2)
}

function leftpad (number, targetLength) {
  let output = number + ''
  while (output.length < targetLength) {
    output = '0' + output
  }
  return output
}

onMounted(() => {
  apiClient.getRoles().then((res) => {
    options.value = [
      {
        value: '',
        title: '全體'
      }
    ].concat(res.map((r) => { return { value: [r], title: r } }))
    options.value[0].value = options.value.slice(1).map(o => o.value).flat()
  })
  apiClient.getAnnouncement()
    .then((Announcements) => {
      announcements.value = Announcements
    })
    .catch((err) => {
      console.log(err, err.config)
    })
})
</script>
