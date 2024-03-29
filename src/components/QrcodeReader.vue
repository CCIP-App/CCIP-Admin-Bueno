<template>
  <div id='QrcodeReader'>
    <center>
      <h2 class="ma-0" v-if=" title != '' ">{{ title }}</h2>
      <div v-if="webrtc" id="camsource"></div>
      <div v-else id="uploadField">
        <label id="uploadButton" for="upload" />
        <input type="file" id="upload" @change="uploadChange">
      </div>
      <p role="subTitle" v-if="subTitle !== '' ">{{ subTitle }}</p>
      <h6 class="ma-0" v-if=" !noResult ">{{ result }}</h6>
    </center>
  </div>
</template>

<script>
import { w69b } from 'barcode.js'
import w69bDecodeworker from 'barcode.js/w69b.qrcode.decodeworker.min.js?url'

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
      scanner: null
    }
  },
  watch: {
    enable: function (state) {
      const self = this
      self.scanner.setStopped(!state)
    }
  },
  mounted () {
    const cam = document.getElementById('camsource')
    const self = this
    w69b.qr.decoding.setWorkerUrl(w69bDecodeworker)
    if (navigator.mediaDevices) {
      self.webrtc = true
      self.scanner = new w69b.qr.ui.ContinuousScanner()
      self.scanner.fg.Hb.setAttribute('playsinline', 'true')
      self.scanner.setDecodedCallback(function (result) {
        self.onSuccess(result)
      })
      self.scanner.render(cam)
    } else {
      self.webrtc = false
      console.log('Sorry, native web camera streaming (getUserMedia) is not supported by this browser...')
    }
  },
  beforeUnmount () {
    if (navigator.mediaDevices) {
      const self = this
      self.scanner.setStopped(true)
      self.scanner.dispose()
    }
  },
  methods: {
    onSuccess (result) {
      this.result = result
      this.$emit('OnSuccess', result)
    },
    uploadChange () {
      const self = this
      const file = document.getElementById('upload').files[0]
      const imageType = /^image\//
      if (!imageType.test(file.type)) {
        console.log('File type not valid')
      }
      // Read file
      const reader = new FileReader()
      reader.addEventListener('load', function () {
        const image = new Image()
        image.onload = function (imageEvent) {
          // Resize the image
          const decoder = new window.w69b.qr.decoding.Decoder()
          decoder.decode(image).then(function (result) {
            // succesfully decoded QR Code.
            self.onSuccess(result.text)
          }, function () {
            self.$emit('OnError', 'no qr code found')
          })
        }
        image.src = this.result
      }.bind(reader), false)
      reader.readAsDataURL(file)
    }
  }
}
</script>

<style lang="scss">
#camsource {
  background: #c9a474;
  border: 2px solid #c9a474;
  border-radius: 15px;
  padding: 10px;
  width: 80vw;
  height: 60vw;
  max-width: 320px;
  max-height: 240px;
}

#uploadField {
  max-width: 300px;
  @media screen and (max-width: 454px) {
    max-width: 150px;
  }
}

#uploadButton {
  cursor: pointer;
  z-index: 1;
  display: block;
  margin: auto;
  min-height: 300px;
  @media screen and (max-width: 454px) {
    min-height: 150px;
  }
  background: url('../assets/uploadfile.png');
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
}

#upload {
  display: none;
}

[role="subTitle"] {
  margin-bottom: 3rem;
}
</style>
