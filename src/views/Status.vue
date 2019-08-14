<template>
  <div id='Status'>
    <!-- <v-alert dismissible type="warning" v-model="alert" role="alert" class="mb-3">{{ alertMessage }}</v-alert> -->
    <!-- <v-alert dismissible type="success" v-model="successCI" role="alert" class="mb-3">{{ alertMessage }}</v-alert> -->
    <v-tabs
      v-model="active"
      grow
    >
      <v-tab v-for="(tab, n) in tabName" :key="n" ripple @click="change(tab)">{{ tab }}</v-tab>
      <v-tab-item v-for="n in tabName.length" :key="n">
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
              <v-data-table
                :headers="headers"
                :items="desserts"
                class="elevation-1"
                :loading="loading"
                :items-per-page.sync="defaultPageItems.rowsPerPage"
                :footer-props="rowsPerpageItems"
                :search="search">
                <v-progress-linear slot="progress" color="primary" indeterminate></v-progress-linear>
                <template v-slot:item="{ item }">
                  <tr>
                    <td
                      v-for="(value, key) in item"
                      :class="[{'text-xs-right': key!=='name'},{'not-exist': value.trim()==='n/a'},{'used': value.trim().match(/^used/i) !== null}]"
                      :key="item.name+key+value">{{ value }}</td>
                    <!-- <td>{{ props.item.name }}</td>
                    <td class="text-xs-right">{{ props.item.calories }}</td>
                    <td class="text-xs-right">{{ props.item.fat }}</td>
                    <td class="text-xs-right">{{ props.item.carbs }}</td>
                    <td class="text-xs-right">{{ props.item.protein }}</td>
                    <td class="text-xs-right">{{ props.item.iron }}</td> -->
                  </tr>
                </template>
              </v-data-table>
            </v-card>
          </v-card-text>
        </v-card>
      </v-tab-item>
    </v-tabs>
  </div>
</template>

<script>
import apiClient from '../module/apiClient'
export default {
  name: 'Status',
  data () {
    return {
      rowsPerpageItems: {
        itemsPerPageOptions: [10, 25, 50, { 'text': 'All', 'value': -1 }]
      },
      defaultPageItems: {
        rowsPerPage: 50
      },
      search: '',
      loading: false,
      active: 0,
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
      let list = [{ text: 'name', value: 'name' }]
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
      let self = this
      return this.rawData.map((element) => {
        let data = {
          // name: element.attr.title + ' ' + element['user_id'],
          name: element['user_id']
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
        data['attr'] = JSON.stringify(element.attr)
        return data
      })
    }
  },
  methods: {
    getData (key) {
      let self = this
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
    let self = this
    apiClient.getRoles().then((res) => {
      self.tabName = res
      if (self.tabName.length > 0) {
        self.change(self.tabName[0])
      }
    })
  }
}
</script>

<style lang="stylus">
[role='userStatus'] {
  font-size: 1.2rem;
}
.not-exist {
  background-color: black
}
.used {
  background-color: green
}
</style>
