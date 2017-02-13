<template>
  <div id='Announcement'>
    <v-container fluid>
      <v-row>
        <v-col xs12 md6 style="margin: 0 auto;">
          <v-card style="margin: 0 auto;">
            <v-card-text class=" text-xs-center">
              <h5 class="ma-0">新增大會公告</h5>
              <v-text-input type="text" placeholder="Chinese" v-model="addAnnounce.zh" :disabled="disabled"></v-text-input>
              <v-text-input type="text" placeholder="English" v-model="addAnnounce.en" :disabled="disabled"></v-text-input>
              <v-text-input type="text" placeholder="URI(option)" v-model="addAnnounce.uri" :disabled="disabled"></v-text-input>
              <v-btn ripple info @click.native="send" :disabled="disabled" :loading="disabled">Send!</v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      <br>
      <v-row>
        <v-col xs12 md6 style="margin: 0 auto;">
          <v-card style="margin: 0 auto;">
            <v-card-text class=" text-xs-center">
              <h5 class="ma-0">大會公告歷程</h5>
              <v-table-overflow v-if="announcementList.length!=0">
                <table>
                  <thead>
                    <tr>
                      <th v-for="header in headers" v-text="header"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, index) in announcementList">
                      <td>{{ formatDatetime(item.datetime) }}</td>
                      <td>{{ item.msg_zh }}</td>
                      <td>{{ item.msg_en }}</td>
                      <td>{{ item.uri }}</td>
                    </tr>
                  </tbody>
                </table>
              </v-table-overflow>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
  export default {
    name: 'Announcement',
    data() {
      return {
        addAnnounce: {
          zh: "",
          en: "",
          uri: ""
        },
        disabled: false,
        headers:["公告時間","中文訊息","英文訊息","網址"],
        announcementList:[]
      }
    },
    methods: {
      send() {

      },
      formatDatetime(time) {
        let datetime = new Date(time * 1000)
        return this.leftpad(datetime.getMonth() + 1, 2) + "/" + this.leftpad(datetime.getDate(), 2) + " " +
          this.leftpad(datetime.getHours(), 2) + ":" + this.leftpad(datetime.getMinutes(), 2)
      },
      leftpad(number, targetLength) {
        var output = number + '';
        while (output.length < targetLength) {
          output = '0' + output;
        }
        return output;
      }
    }
  }

</script>

<style scoped>

</style>