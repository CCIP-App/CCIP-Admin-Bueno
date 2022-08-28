<template>
  <div id='Status'>
    <!-- <v-alert dismissible type="warning" v-model="alert" role="alert" class="mb-3">{{ alertMessage }}</v-alert> -->
    <!-- <v-alert dismissible type="success" v-model="successCI" role="alert" class="mb-3">{{ alertMessage }}</v-alert> -->
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
                      :class="[{'text-xs-right': key!=='name'},{'not-exist': value.trim()==='n/a'},{'used': value.trim().match(/^used/i) !== null}]"
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

<script>
import apiClient from '../module/apiClient'
export default {
  name: 'Status',
  data () {
    return {
      search: '',
      loading: false,
      active: null,
      tabName: [],
      rawHeader: [],
      rawData: [],
      displayAllAttr: false
      // qrState: true,
      // token: "",
      // alert: false,
      // successCI: false,
      // alertMessage: "",
      // user: {}
    }
  },
  computed: {
    headers: function () {
      const list = [{ text: 'name', value: 'name' }]
      this.rawHeader.forEach((element) => {
        list.push({
          text: element,
          value: element
        })
      })
      list.push({ text: 'attr', value: 'attr' })
      return list
    },
    desserts: function () {
      const self = this
      return this.rawData
        .map((element) => {
          const data = {
            // name: element.attr.title + ' ' + element['user_id'],
            name: element.user_id
          }
          self.rawHeader.forEach((ele) => {
            if (element.scenario[ele] === undefined) {
              data[ele] = 'n/a'
            } else {
              data[ele] = (element.scenario[ele].used === undefined) ? 'not used' : 'used'
              if (this.displayAllAttr) {
                if (element.scenario[ele].attr !== undefined && Object.keys(element.scenario[ele].attr).length > 0) {
                  data[ele] += ' ' + JSON.stringify(element.scenario[ele].attr)
                }
              }
            }
          })
          data.attr = JSON.stringify(element.attr)
          return data
        })
        .filter((data) => !self.search ? true : data.name.includes(self.search))
    }
  },
  methods: {
    getData (key) {
      const self = this
      this.loading = true
      apiClient.allScenarios(key).then((res) => {
        self.rawHeader = res
        return apiClient.getAllRoleScenarios(key)
      }).then((res) => {
        self.rawData = res
        self.loading = false
      })
    },
    change (key) {
      this.rawHeader = []
      this.rawData = []
      this.getData(key)
    }
  },
  mounted () {
    const self = this
    apiClient.getRoles().then((res) => {
      self.tabName = res
      self.active = res[0]
      if (self.tabName.length > 0) {
        self.change(self.tabName[0])
      }
    })
  }
}
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
