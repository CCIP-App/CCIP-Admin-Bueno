<template>
  <div class="qrcode-reader">
    <h2 v-if="title" class="ma-0">{{ title }}</h2>
    <template v-if="cameraSupported">
      <div class="camera" :data-state="scanState" :style="{ width, height }">
        <video ref="video" autoplay muted playsinline />
        <svg v-if="enable && outline" :viewBox="`0 0 ${frameWidth} ${frameHeight}`" aria-hidden="true">
          <polygon :points="outline" />
        </svg>
      </div>
      <p class="scan-status" role="status">{{ statusText }}</p>
      <button v-if="cameraState === 'error'" type="button" @click="startCamera">重新啟用相機</button>
    </template>
    <label v-else>
      上傳 QR Code 圖片
      <input type="file" accept="image/*" :disabled="!enable" @change="uploadChange">
    </label>
    <p v-if="subTitle">{{ subTitle }}</p>
    <p v-if="errorMessage" role="alert">{{ errorMessage }}</p>
    <p v-if="!noResult">{{ result }}</p>
  </div>
</template>

<script>
import { prepareZXingModule, readBarcodes } from 'zxing-wasm/reader'
import wasmUrl from 'zxing-wasm/reader/zxing_reader.wasm?url'

// Keep decoding available without a third-party CDN at event venues.
prepareZXingModule({
  overrides: {
    locateFile: (path, prefix) => path.endsWith('.wasm') ? wasmUrl : prefix + path
  }
})
const readerOptions = { formats: ['QRCode'], textMode: 'Plain', returnErrors: true }

export default {
  name: 'QrcodeReader',
  props: {
    title: { type: String, default: '' },
    subTitle: { type: String, default: '' },
    enable: Boolean,
    noResult: Boolean,
    width: { type: String, default: '320px' },
    height: { type: String, default: '240px' }
  },
  emits: ['OnSuccess', 'OnError'],
  data () {
    return {
      result: '',
      lastScanned: '',
      errorMessage: '',
      cameraSupported: Boolean(navigator.mediaDevices?.getUserMedia),
      cameraState: 'starting',
      outline: '',
      frameWidth: 1,
      frameHeight: 1,
      frame: null,
      running: false,
      stream: null,
      timer: null
    }
  },
  computed: {
    scanState () {
      return !this.enable && this.cameraState !== 'error' ? 'paused' : this.cameraState
    },
    statusText () {
      return {
        starting: '正在啟用相機…',
        scanning: '掃描中，請將 QR Code 對準鏡頭',
        detected: '已找到 QR Code，請保持穩定',
        decoded: '已讀取 QR Code',
        paused: '掃描已暫停',
        error: '相機無法啟用'
      }[this.scanState]
    }
  },
  watch: {
    enable () {
      this.lastScanned = ''
      this.outline = ''
      if (this.cameraState === 'decoded' || this.cameraState === 'detected') this.cameraState = 'scanning'
    }
  },
  mounted () {
    this.running = true
    if (this.cameraSupported) this.startCamera()
  },
  beforeUnmount () {
    this.running = false
    clearTimeout(this.timer)
    this.stream?.getTracks().forEach(track => track.stop())
  },
  methods: {
    async startCamera () {
      this.cameraState = 'starting'
      this.errorMessage = ''
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
        if (!this.running) {
          stream.getTracks().forEach(track => track.stop())
          return
        }
        this.stream = stream
        this.$refs.video.srcObject = stream
        await this.$refs.video.play()
        if (!this.running) return
        this.cameraState = 'scanning'
        this.frame = document.createElement('canvas').getContext('2d', { willReadFrequently: true })
        this.scan()
      } catch (error) {
        if (this.running) this.onCameraError(error)
      }
    },
    async scan () {
      if (!this.running) return
      try {
        if (this.enable && this.$refs.video.readyState >= 2) {
          const video = this.$refs.video
          // ponytail: cap frames at 960px for throughput; raise for small or distant codes.
          const scale = Math.min(1, 960 / Math.max(video.videoWidth, video.videoHeight))
          this.frameWidth = Math.max(1, Math.round(video.videoWidth * scale))
          this.frameHeight = Math.max(1, Math.round(video.videoHeight * scale))
          if (this.frame.canvas.width !== this.frameWidth) this.frame.canvas.width = this.frameWidth
          if (this.frame.canvas.height !== this.frameHeight) this.frame.canvas.height = this.frameHeight
          this.frame.drawImage(video, 0, 0, this.frameWidth, this.frameHeight)
          const codes = await readBarcodes(this.frame.getImageData(0, 0, this.frameWidth, this.frameHeight), readerOptions)
          if (!this.running || !this.enable) return
          const code = codes.find(code => code.isValid) || codes[0]
          this.outline = code
            ? ['topLeft', 'topRight', 'bottomRight', 'bottomLeft']
                .map(corner => `${code.position[corner].x},${code.position[corner].y}`).join(' ')
            : ''
          this.cameraState = code ? (code.isValid ? 'decoded' : 'detected') : 'scanning'
          const value = code?.isValid ? code.text : ''
          if (value && value !== this.lastScanned) this.onDetect(code)
          this.lastScanned = value
        }
      } catch (error) {
        if (this.running) this.onCameraError(error)
        return
      } finally {
        if (this.running && this.cameraState !== 'error') this.timer = setTimeout(() => this.scan(), 100)
      }
    },
    async uploadChange (event) {
      const file = event.target.files[0]
      if (!file || !this.enable) return
      try {
        if (!file.type.startsWith('image/')) throw new Error('請選擇圖片檔案')
        const codes = await readBarcodes(file, readerOptions)
        const code = codes.find(code => code.isValid)
        if (!code) throw new Error('找不到 QR Code')
        if (this.running && this.enable) this.onDetect(code)
      } catch (error) {
        if (this.running) this.onError(error)
      } finally {
        event.target.value = ''
      }
    },
    onDetect (code) {
      this.errorMessage = ''
      this.result = code.text
      this.$emit('OnSuccess', this.result)
    },
    onError (error) {
      this.errorMessage = error.message
      this.$emit('OnError', error.message)
    },
    onCameraError (error) {
      this.cameraState = 'error'
      this.outline = ''
      this.stream?.getTracks().forEach(track => track.stop())
      this.errorMessage = error.name === 'NotAllowedError'
        ? '請允許瀏覽器使用相機，再重新啟用相機。'
        : '無法啟用相機，請確認相機連線及是否被其他程式使用。'
      this.$emit('OnError', error.message)
    }
  }
}
</script>

<style scoped>
.qrcode-reader {
  text-align: center;
}

.camera {
  position: relative;
  max-width: 100%;
  overflow: hidden;
  background: #111;
  margin: 0 auto 1rem;
  border: 2px solid #c9a474;
  border-radius: 15px;
}

.camera video,
.camera svg {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.camera svg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.camera polygon {
  fill: none;
  stroke: #ffc107;
  stroke-width: 3;
  vector-effect: non-scaling-stroke;
}

.camera[data-state="decoded"] polygon {
  stroke: #00e676;
}

.scan-status {
  margin: 0 0 0.5rem;
  font-size: 0.875rem;
}

label {
  display: block;
}

input {
  display: block;
  max-width: 100%;
  margin: 0.5rem auto;
}
</style>
