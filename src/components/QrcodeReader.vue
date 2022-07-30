<template>
  <div id='QrcodeReader'>
    <center>
      <h2 class="ma-0" v-if=" title != '' ">{{ title }}</h2>
      <p role="subTitle" v-if="subTitle !== '' ">{{ subTitle }}</p>
      <div v-if="!isWebRTCSupported">
        <p>連 iOS 都支援 WebRTC 了，您是不是該換裝置了呢？</p>
      </div>
      <template v-else>
        <div v-show="enable">
          <video ref="preview" :width="previewWidth" autoplay playsinline></video>
        </div>
        <div v-show="!enable">
        <button id="enableButton" class="OpenCamera" @click="startScanner"></button>
      </div>
      </template>
      <h6 class="ma-0" v-if=" !noResult ">{{ result }}</h6>
    </center>
  </div>
</template>

<script>
import QrScanner from 'qr-scanner'

export default {
  name: 'QrcodeReader',
  props: {
    title: {
      type: String,
      default: ''
    },
    subTitle: {
      type: String,
      default: ''
    },
    enable: Boolean,
    noResult: Boolean,
    width: {
      type: String,
      default: 320 + 'px'
    },
    height: {
      type: String,
      default: 240 + 'px'
    }
  },
  data () {
    return {
      result: 'Loading...',
      cam: null,
      webrtc: true,
      scanner: null,
      previewWidth: null
    }
  },
  watch: {
    enable: function (state) {
      // var self = this
      // self.scanner.setStopped(!state)````
    }
  },
  mounted () {
    this.startScanner()
  },
  beforeDestroy () {
    this.disableScanner()
  },
  computed: {
    isWebRTCSupported () {
      return !!navigator.mediaDevices
    }
  },
  methods: {
    onSuccess (result) {
      this.result = result
      this.$emit('OnSuccess', result)
    },
    startScanner () {
      if (this.isWebRTCSupported) {
        this.enable = true
        QrScanner.WORKER_PATH = 'js/qr-scanner-worker.min.js'
        this.scanner = new QrScanner(this.$refs.preview, this.onSuccess)
        this.scanner.setInversionMode('both')
        this.setPreviewSize()
        this.scanner.start()
      }
    },
    setPreviewSize () {
      const width = window.innerWidth
      const height = window.innerHeight
      const aspect = width / height
      if (width > height) {
        if (width >= 1280) {
          this.previewWidth = (Math.min(Math.round((height - 420) * aspect), 1280)) + 'px'
        } else {
          this.previewWidth = (this.width || Math.round(width * 0.8)) + 'px'
        }
      } else {
        if (width <= 576) {
          this.previewWidth = (Math.round(height * 0.8 * aspect)) + 'px'
        } else {
          this.previewWidth = (Math.round(height * 0.4 * aspect)) + 'px'
        }
      }
    },
    disableScanner () {
      if (this.scanner) {
        this.enable = false
        this.scanner.destroy()
        this.scanner = null
      }
    }
  }
}
</script>

<style lang="stylus">
  .OpenCamera
    @media screen and (max-width: 454px) // must bigger than 454px for two column
      min-height: 150px
    background-size: cover
    background-repeat: no-repeat
    background-position: center
  #enableButton
    min-height: 250px
    max-height: 50vw
    min-width: 250px
    max-width: 50vw
    border: none
  [role="subTitle"]
    margin-bottom: 3rem
</style>
