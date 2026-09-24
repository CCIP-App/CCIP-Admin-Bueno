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
import { computed, onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from 'vue'
import { prepareZXingModule, readBarcodes } from 'zxing-wasm/reader'
import wasmUrl from 'zxing-wasm/reader/zxing_reader.wasm?url'

// Module scope (runs once, not per instance): keep decoding available without a third-party CDN at event venues.
prepareZXingModule({
  overrides: {
    locateFile: (path, prefix) => path.endsWith('.wasm') ? wasmUrl : prefix + path
  }
})
const readerOptions = { formats: ['QRCode'], textMode: 'Plain', returnErrors: true }
</script>

<script setup>
const props = defineProps({
  title: { type: String, default: '' },
  subTitle: { type: String, default: '' },
  enable: Boolean,
  noResult: Boolean,
  width: { type: String, default: '320px' },
  height: { type: String, default: '240px' }
})
const emit = defineEmits(['OnSuccess', 'OnError'])

const videoRef = useTemplateRef('video')
const result = ref('')
const errorMessage = ref('')
const cameraSupported = Boolean(navigator.mediaDevices?.getUserMedia)
const cameraState = ref('starting')
const outline = ref('')
const frameWidth = ref(1)
const frameHeight = ref(1)
let lastScanned = ''
let frame = null
let running = false
let stream = null
let timer = null

const scanState = computed(() => !props.enable && cameraState.value !== 'error' ? 'paused' : cameraState.value)
const statusText = computed(() => ({
  starting: '正在啟用相機…',
  scanning: '掃描中，請將 QR Code 對準鏡頭',
  detected: '已找到 QR Code，請保持穩定',
  decoded: '已讀取 QR Code',
  paused: '掃描已暫停',
  error: '相機無法啟用'
})[scanState.value])

watch(() => props.enable, () => {
  lastScanned = ''
  outline.value = ''
  if (cameraState.value === 'decoded' || cameraState.value === 'detected') cameraState.value = 'scanning'
})

onMounted(() => {
  running = true
  if (cameraSupported) startCamera()
})

onBeforeUnmount(() => {
  running = false
  clearTimeout(timer)
  stream?.getTracks().forEach(track => track.stop())
})

async function startCamera () {
  cameraState.value = 'starting'
  errorMessage.value = ''
  try {
    const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
    if (!running) {
      mediaStream.getTracks().forEach(track => track.stop())
      return
    }
    stream = mediaStream
    videoRef.value.srcObject = mediaStream
    await videoRef.value.play()
    if (!running) return
    cameraState.value = 'scanning'
    frame = document.createElement('canvas').getContext('2d', { willReadFrequently: true })
    scan()
  } catch (error) {
    if (running) onCameraError(error)
  }
}

async function scan () {
  if (!running) return
  try {
    if (props.enable && videoRef.value.readyState >= 2) {
      const video = videoRef.value
      // ponytail: cap frames at 960px for throughput; raise for small or distant codes.
      const scale = Math.min(1, 960 / Math.max(video.videoWidth, video.videoHeight))
      frameWidth.value = Math.max(1, Math.round(video.videoWidth * scale))
      frameHeight.value = Math.max(1, Math.round(video.videoHeight * scale))
      if (frame.canvas.width !== frameWidth.value) frame.canvas.width = frameWidth.value
      if (frame.canvas.height !== frameHeight.value) frame.canvas.height = frameHeight.value
      frame.drawImage(video, 0, 0, frameWidth.value, frameHeight.value)
      const codes = await readBarcodes(frame.getImageData(0, 0, frameWidth.value, frameHeight.value), readerOptions)
      if (!running || !props.enable) return
      const code = codes.find(code => code.isValid) || codes[0]
      outline.value = code
        ? ['topLeft', 'topRight', 'bottomRight', 'bottomLeft']
            .map(corner => `${code.position[corner].x},${code.position[corner].y}`).join(' ')
        : ''
      cameraState.value = code ? (code.isValid ? 'decoded' : 'detected') : 'scanning'
      const value = code?.isValid ? code.text : ''
      if (value && value !== lastScanned) onDetect(code)
      lastScanned = value
    }
  } catch (error) {
    if (running) onCameraError(error)
    return
  } finally {
    if (running && cameraState.value !== 'error') timer = setTimeout(() => scan(), 100)
  }
}

async function uploadChange (event) {
  const file = event.target.files[0]
  if (!file || !props.enable) return
  try {
    if (!file.type.startsWith('image/')) throw new Error('請選擇圖片檔案')
    const codes = await readBarcodes(file, readerOptions)
    const code = codes.find(code => code.isValid)
    if (!code) throw new Error('找不到 QR Code')
    if (running && props.enable) onDetect(code)
  } catch (error) {
    if (running) onError(error)
  } finally {
    event.target.value = ''
  }
}

function onDetect (code) {
  errorMessage.value = ''
  result.value = code.text
  emit('OnSuccess', result.value)
}

function onError (error) {
  errorMessage.value = error.message
  emit('OnError', error.message)
}

function onCameraError (error) {
  cameraState.value = 'error'
  outline.value = ''
  stream?.getTracks().forEach(track => track.stop())
  errorMessage.value = error.name === 'NotAllowedError'
    ? '請允許瀏覽器使用相機，再重新啟用相機。'
    : '無法啟用相機，請確認相機連線及是否被其他程式使用。'
  emit('OnError', error.message)
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
