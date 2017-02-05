<template>
  <div id='Dashboard'>
    <v-container fluid>
      <v-row>
        <v-col xs12>
          <v-card>
            <v-card-text>
              <h4 class="ma-0 text-xs-left">App 使用率</h4>
              <p class="text-xs-center ma-0 mt-4">{{appUse+" / 100 - "+appUse+"%"}}</p>
              <v-progress-linear v-model="appUse" class="ma-0 mb-4"></v-progress-linear>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      <br>
      <v-row>
        <v-col xs12 md4>
          <v-card>
            <v-card-text>
              <h4 class="ma-0 text-xs-left">App 使用率</h4>
              <high-chart :options="defaultOption(CIData.attendees)" style="display: flex" idName="1"></high-chart>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col xs12 md4>
          <v-card>
            <v-card-text>
              <h4 class="ma-0 text-xs-left">App 使用率</h4>
              <high-chart :options="defaultOption(CIData.attendees)" style="display: flex" idName="2"></high-chart>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col xs12 md4>
          <v-card>
            <v-card-text>
              <h4 class="ma-0 text-xs-left">App 使用率</h4>
              <high-chart :options="defaultOption(CIData.attendees)" style="display: flex" idName="3"></high-chart>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
  export default {
    name: 'Dashboard',
    data() {
      return {
        appUse: 45,
      }
    },
    computed: {
      CIData() {
        return {
          attendees:[
            {name:"App報到",y:300},
            {name:"人工報到",y:50},
            {name:"未報到",y:100}
          ]
        }
      }
    },
    methods: {
      // Overwriting base render method with actual data.
      defaultOption(datas){
        return {
          chart: {
            type: 'pie',
            spacing:[0,0,0,0],
            reflow:true
          },
          title: {
            text: ''
          },
          plotOptions: {
            series: {
              dataLabels: {
                enabled: true,
                format: '{point.name}<br> {point.y:.1f}%',
                distance: -30
              }
            }
          },

          tooltip: {
            headerFormat: '',
            pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y}</b><br/>'
          },
          series: [{
            name: 'Brands',
            colorByPoint: true,
            data: datas
          }]
        }
      }
    },
    mounted () {
      
    }
  }
</script>

<style scoped>

</style>