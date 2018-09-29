<template>
  <div id='Status'>
    <!-- <v-alert dismissible type="warning" v-model="alert" role="alert" class="mb-3">{{ alertMessage }}</v-alert> -->
    <!-- <v-alert dismissible type="success" v-model="successCI" role="alert" class="mb-3">{{ alertMessage }}</v-alert> -->
    <v-tabs
      v-model="active"
      grow
      @input="change"
    >
      <v-tab :key="0" ripple>工作人員</v-tab>
      <v-tab :key="1" ripple>講者</v-tab>
      <v-tab :key="2" ripple>會衆</v-tab>
      <v-tab-item
        v-for="n in 3"
        :key="n"
      >
        <v-card flat>
          <v-card-text>
            <v-card>
              <v-card-title>
                結果
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
                :search="search">
                <template slot="items" slot-scope="props">
                  <td
                    v-for="(value, key) in props.item"
                    :key="key+value"
                    :rows-per-page-text="5"
                    :class="[{['text-xs-right']: key!=='name'},{['not-exist']: value==='not exist'},{['used']: value==='used'}]"> {{ value }}</td>
                  <!-- <td>{{ props.item.name }}</td>
                  <td class="text-xs-right">{{ props.item.calories }}</td>
                  <td class="text-xs-right">{{ props.item.fat }}</td>
                  <td class="text-xs-right">{{ props.item.carbs }}</td>
                  <td class="text-xs-right">{{ props.item.protein }}</td>
                  <td class="text-xs-right">{{ props.item.iron }}</td> -->
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
import apiClient from "../modal/apiClient";
export default {
  name: "Status",
  data() {
    return {
      search: '',
      active: 0,
      tabName: ['staff', 'speaker', 'audience'],
      rawHeader: [],
      rawData: []
      // qrState: true,
      // token: "",
      // alert: false,
      // successCI: false,
      // alertMessage: "",
      // user: {}
    };
  },
  computed: {
    headers: function () {
      let list = [{text: 'name', value: 'name'}]
      this.rawHeader.forEach((element) => {
        list.push({
          text: element,
          value: element
        })
      })
      list.push({text: 'attr', value: 'attr'})
      return list
    },
    desserts: function () {
      let self = this
      return this.rawData.map((element) => {
        let data = {
          // name: element.attr.title + ' ' + element['user_id'],
          name: element['user_id'],
        }
        self.rawHeader.forEach((ele) => {
          if (element.scenario[ele] === undefined) {
            data[ele] = 'not exist'
          } else {
            data[ele] = (element.scenario[ele].used === undefined) ? 'not used' : 'used'
          }
        })
        data['attr'] = JSON.stringify(element.attr)
        return data
      })
    }
  },
  methods: {
    getHeader () {
      let self = this
      apiClient.allScenarios(this.tabName[this.active]).then((res) => {
        self.rawHeader = res;
      })
    },
    getData () {
      let self = this
      apiClient.getAllTypeScenarios(this.tabName[this.active]).then((res) => {
        self.rawData = res;
      })
    },
    change () {
      this.getHeader()
      this.getData()
    }
  },
  mouted () {
    this.getHeader()
    this.getData()
  }
};
</script>

<style lang="stylus">
[role='userStatus'] {
  font-size: 1.2rem;
}
.not-exist {
  background-color black
}
.used {
  background-color green
}
</style>
