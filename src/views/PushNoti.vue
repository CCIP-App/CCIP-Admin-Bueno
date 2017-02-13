<template>
  <div id='PushNoti'>
    <v-container fluid>
      <v-row>
        <v-col xs12 md6 style="margin: 0 auto;">
          <v-card style="margin: 0 auto;">
            <v-card-text class=" text-xs-center">
              <h5 class="ma-0">新增推播通知</h5>
              <v-select v-bind:options="options" placeholder="選擇對象" v-model.number="addPush.to" :disabled="disabled"></v-select>
              <v-text-input type="text" placeholder="Chinese" v-model="addPush.zh" :disabled="disabled"></v-text-input>
              <v-text-input type="text" placeholder="English" v-model="addPush.en" :disabled="disabled"></v-text-input>
              <v-text-input type="text" placeholder="URI(option)" v-model="addPush.uri" :disabled="disabled"></v-text-input>
              <v-btn ripple info @click.native="send" :disabled="disabled" :loading="disabled">Send!</v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
  export default {
    name: 'PushNoti',
    data() {
      return {
        options:[{
          value:1,
          text:"全體"
        },{
          value:2,
          text:"僅會眾"
        },
        {
          value:3,
          text:"僅工作人員"
        },
        ],
        addPush: {
          to: 0,
          zh: "",
          en: "",
          uri: ""
        },
        disabled: false
      }
    },
    methods: {
      send(){

      }
    }
  }

</script>

<style scoped>

</style>