<template>
  <div id="KingGame">
    <v-row
      row
      wrap
    >
      <v-col
        cols="12"
        :md="6"
      >
        <qrcode-reader
          :enable="qrState"
          :width="'100%'"
          :height="'300px'"
          :noResult="true"
          @OnSuccess="onSuccess"
          @OnError="onError"
        />
      </v-col>
      <v-col
        cols="12"
        :md="6"
      >
        <v-alert
          closable
          type="warning"
          v-model="alert"
          role="alert"
        >{{ alertMessage }}</v-alert>
        <v-card>
          <v-card-title>
            <span>知識王</span>
          </v-card-title>
          <v-card-text>
            <ul
              v-if="user.nick !== ''"
              role="userStatus"
            >
              <li>Nickname: {{ user.nick }}</li>
              <li>High Score: {{ user.score }}</li>
              <li>Score: {{ user.score - user.cost }}</li>
              <li>兌換過：</li>
              <ul v-if="user.prizes.length > 0">
                <li
                  v-for="(prize, index) in user.prizes"
                  :key="index"
                >{{ prize.name }}</li>
              </ul>
            </ul>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col
        cols="12"
        :md="12"
      >
        <!-- <v-data-table
          :headers="headers"
          :items="prizes"
          hide-actions
          class="elevation-1"
        >
          <template
            slot="items"
            slot-scope="props"
          >
            <td>{{ props.item.id }}</td>
            <td>{{ props.item.name }}</td>
            <td>{{ props.item.needScore }}</td>
            <td>{{ props.item.convertTime }}</td>
            <td>
              <v-btn
                color="blue"
                dark
                @click="convert(props.item.id)"
              >兌換</v-btn>
            </td>
          </template>
        </v-data-table> -->
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import kingApi from '../module/kingApi.js'
import QrcodeReader from '@/components/QrcodeReader.vue'

const qrState = ref(true)
const token = ref('')
const user = ref({
  nick: '',
  score: 0,
  cost: 0,
  prizes: []
})
const alert = ref(false)
const alertMessage = ref('')
// headers, prizes and convert back the prize table that is commented out in the template
// eslint-disable-next-line no-unused-vars
const headers = ref([
  {
    text: 'id',
    align: 'left',
    value: 'id'
  },
  { text: '名稱', value: 'name' },
  { text: '兌換分數', value: 'needScore' },
  { text: '已兌換獎品數', value: 'convertTime' },
  { text: '操作區', value: 'doing' }
])
const prizes = ref([])

function onSuccess (scannedToken) {
  token.value = scannedToken
  loadUser()
}

function onError (err) {
  console.log(err)
}

function loadUser () {
  kingApi
    .getUser(token.value)
    .then(res => {
      user.value.nick = res.data.nick
      user.value.score = res.data.score
      user.value.cost = res.data.cost
      user.value.prizes = res.data.prizes
    })
    .catch(err => {
      // Show dialog: show request err
      if (err.response) {
        alertMessage.value =
          err.response.status + ' - ' + err.response.data.message
      } else {
        alertMessage.value = 'Something error on network'
      }
      alert.value = true
    })
}

function loadPrizes () {
  kingApi
    .getPrizes()
    .then(res => {
      prizes.value = res.data
    })
    .catch(err => {
      // Show dialog: show request err
      if (err.response) {
        alertMessage.value =
          err.response.status + ' - ' + err.response.data.message
      } else {
        alertMessage.value = 'Something error on network'
      }
      alert.value = true
    })
}

// eslint-disable-next-line no-unused-vars
function convert (id) {
  if (window.confirm('確定要兌換？')) {
    kingApi
      .convert(id, token.value)
      .then(res => {
        window.alert(res.data.status !== 'error' ? '兌換成功' : '兌換失敗')
        loadUser()
      })
      .catch(err => {
        // Show dialog: show request err
        if (err.response) {
          alertMessage.value =
            err.response.status + ' - ' + err.response.data.message
        } else {
          alertMessage.value = 'Something error on network'
        }
        alert.value = true
      })
  }
}

onMounted(() => {
  loadPrizes()
})
</script>

<style lang="scss">
[role='userStatus'] {
  font-size: 1.2rem;
}
</style>
