<template>
  <div id='CheckIn'>
    <v-row>
      <v-col xs12 md5>
        <qrcode-reader :enable="qrState" :width="'32vw'" :height="'24vw'" :noResult="true" @OnSuccess="OnSuccess" />
      </v-col>
      <v-col xs12 md7>
        <v-card>
          <v-card-row class="green darken-1">
            <v-card-title>
            <span class="white--text">CheckIn</span>
            </v-card-title>
          </v-card-row>
          <v-card-text>
            <v-card-row>
            </v-card-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  name: 'CheckIn',
  data() {
    return {
      qrState: true
    }
  },
  methods: {
    OnSuccess(result) {
      window.alert(result)
    }
  }
}
</script>

<style lang="stylus">
</style>
