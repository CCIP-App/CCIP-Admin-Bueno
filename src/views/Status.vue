<template>
  <div id='Status'>
    <!-- <v-alert closable type="warning" v-model="alert" role="alert" class="mb-3">{{ alertMessage }}</v-alert> -->
    <!-- <v-alert closable type="success" v-model="successCI" role="alert" class="mb-3">{{ alertMessage }}</v-alert> -->
    <v-tabs
      v-model="active"
      grow
    >
      <v-tab v-for="tab in tabName" :key="tab" :value="tab" ripple @click="change(tab)">{{ tab }}</v-tab>
    </v-tabs>
    <v-window v-model="active">
      <v-window-item v-for="tab in tabName" :key="tab" :value="tab">
        <v-card flat>
          <v-card-text>
            <v-card>
              <v-card-title>
                結果
                <v-spacer></v-spacer>
                <v-switch
                  v-model="displayAllAttr"
                  color="primary"
                  :label="`顯示全部欄位資料: ${displayAllAttr ? '開' : '關'}`"
                ></v-switch>
                <v-spacer></v-spacer>
                <v-text-field
                  v-model="search"
                  append-icon="search"
                  label="Search"
                  single-line
                  hide-details
                ></v-text-field>
              </v-card-title>
              <v-table>
                <thead>
                  <tr>
                    <th v-for="header in headers" :key="header.value">{{ header.text }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in desserts"  :key="item">
                    <td
                      v-for="(value, key) in item"
                      :class="[{'not-exist': value.trim()==='n/a'},{'used': value.trim().match(/^used/i) !== null}]"
                      :key="item.name+key+value">{{ value }}</td>
                  </tr>
                </tbody>
              </v-table>
            </v-card>
          </v-card-text>
        </v-card>
      </v-window-item>
    </v-window>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import apiClient from '../module/apiClient'

const search = ref('')
const loading = ref(false)
const active = ref(null)
const tabName = ref([])
const rawHeader = ref([])
const rawData = ref([])
const displayAllAttr = ref(false)
// const qrState = ref(true)
// const token = ref('')
// const alert = ref(false)
// const successCI = ref(false)
// const alertMessage = ref('')
// const user = ref({})

const headers = computed(() => {
  const list = [{ text: 'name', value: 'name' }]
  rawHeader.value.forEach((element) => {
    list.push({
      text: element,
      value: element
    })
  })
  list.push({ text: 'attr', value: 'attr' })
  return list
})

const desserts = computed(() => {
  return rawData.value
    .map((element) => {
      const data = {
        // name: element.attr.title + ' ' + element['user_id'],
        name: element.user_id
      }
      rawHeader.value.forEach((ele) => {
        if (element.scenario[ele] === undefined) {
          data[ele] = 'n/a'
        } else {
          data[ele] = (element.scenario[ele].used === undefined) ? 'not used' : 'used'
          if (displayAllAttr.value) {
            if (element.scenario[ele].attr !== undefined && Object.keys(element.scenario[ele].attr).length > 0) {
              data[ele] += ' ' + JSON.stringify(element.scenario[ele].attr)
            }
          }
        }
      })
      data.attr = JSON.stringify(element.attr)
      return data
    })
    .filter((data) => !search.value ? true : data.name.includes(search.value))
})

function getData (key) {
  loading.value = true
  apiClient.allScenarios(key).then((res) => {
    rawHeader.value = res
    return apiClient.getAllRoleScenarios(key)
  }).then((res) => {
    rawData.value = res
    loading.value = false
  })
}

function change (key) {
  rawHeader.value = []
  rawData.value = []
  getData(key)
}

onMounted(() => {
  apiClient.getRoles().then((res) => {
    tabName.value = res
    active.value = res[0]
    if (tabName.value.length > 0) {
      change(tabName.value[0])
    }
  })
})
</script>

<style lang="scss">
[role='userStatus'] {
  font-size: 1.2rem;
}
.not-exist {
  background-color: black;
}
.used {
  background-color: green;
}
</style>
