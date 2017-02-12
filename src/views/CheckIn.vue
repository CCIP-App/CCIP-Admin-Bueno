<template>
  <div id='CheckIn'>
    <qrcode-reader :enable="qrState" :width="320" :height="240" :noResult="true" title="QRCode Scanner" @OnSuccess="OnSuccess"></qrcode-reader>
  </div>
</template>

<script>
export default {
  name: 'CheckIn',
  data () {
    return {
      qrState:true
    }
  },
  methods: {
    OnSuccess(result){
      window.alert(result)
    }
  }
}
</script>

<style scoped>

</style>