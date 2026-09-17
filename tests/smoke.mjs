import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { chromium } from 'playwright'
import { build, preview } from 'vite'
import { md5Hex, sha1Hex } from '../src/utils/hash.js'
import shuffledBingo from '../src/utils/shuffledBingo.js'

const token = 'upgrade-smoke-token'
const qrPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAQgAAAEICAAAAACGnTUjAAAFdElEQVR4XmP8zzAKQCHANBoMkBAYDQiG0YBAyQyjKWI0RTCMpghsFcRo1hjNGqNZg2E0a+BpPY6WEaNlxGgZMVpGMIyWEQwEwWhhOVpYjhaWo4XlaGHJMFpYMhALRmuN0VpjtNYYrTVGa43RWoNhtNZgIBGMVp+j1edo9Yk107AQykqMDOQB2LoLmH5cfHTT0e1DX79BqXtw+Wa0jBgtI0bLCKy5YzRrjGaN0awxmjXwNQRYiG0lELsek9h6Hlf7At096Opg8tR2z2hhOVpYjhaWo4UlvvJwtIwYLSNGywisOYTodgRMN652AqF6HVd7AFe7gNT2CLrvSN2HMlpGjJYRo2XEaDtitB3BQBiMFpajhSVqKiG5HcFAISDUDiHU3mCgERjNGqNZAzVpjaaI0RQxmiKwFrejWWM0awxQOwLXOgf0dRMw59G7PTGaNUazxmitMVpr4OumjJYRo2XEaBmBNYeQPB5B6nwBrnYCoXWYxLYnqHWO1mgZMVpGjJYRo+2I0XYEA2EwWliOFpaoqYTodgS5+ySIXU+JnnhxtT/Q2xcMVAKjWWM0a4y2I0bbEaPtCCIK1NHCcrSwRE0mND8Xm9A+TvR2AaH5DwYagdGsMZo1RtsRWDPXaNYYzRqjWWM0a+CreckejyB2XgLXvAOu9gWhcQ9KxzdwBcZoYTlaWI4WlqOFJb7CcrSMGC0jRssIrDmE5PEIQvstYLYQOw9CaH0Dsfah+47YcRCG0awxmjVGq8/R6pOBMBhtR4wWlqOFJdZ8QvJ5lrjmHYgdX6B0fwahcRBy112OlhGjZcRoGTHaoBptUI02qBiIBqO1BjSoCLYj0OttUs+TIna8AVf7BBalhMzBJU9su2I0RYy2I0bbEaPtiNF2xGg7YrQdwUAqoPr9GrjWL5A6TkCoXYHuUXR7cY1b4Aqg0XbEaDtitB0x2o4YbUcQUYWMFpajhSVqMiF6PAJXvY0uTmhdJantCXLXR5DaoBrNGqNZY7QdgTXXjGaN0awxmjVGswa+KpXo8QhC8waw+h7XvAeh8QFS9RFaR8lIYkNitLAcLSxHC8vRwhJfsTFaRoyWEaNlBNYcQvR+DULrItBNxzW/AVOH3q4gVO3jaoeQ6i5c9oyWEaNlxGgZMdqOGG1HMBAGo4XlaGGJmkoYSV0HSe44AKF2A6nrIdATOyH9hPw5mjVGs8ZoO2K0HTHajhhtRzAQDUZrDWhQ0f08S0L1P0yeUHuFWHXEjleMpojRdsRoO2K0HYGvChktI0bLiNEyAmsOofp+DZgthPr/hNZL4MrPhNoFpK6LYBjNGqNZY7T6HK0+GQiD0XbEaGE5WliS146A6SJ2nwWucQR0cULrJ3DlakLrPdH1EduuGC0jRsuI0TJitEE12qAabVAxEA1Gaw1oUJF8bziuepnQfk/09gjMHGLXW5A7zkBskhhNEaPtiNF2xGg7Al95MVpGjJYRo2UE1hxCcjuCgURA7H5RmLHo4xTEtk9wOYvYcZTRMmK0jBgtI0bbEaPtCCIK+NHCcrSwRE0mNG9HEBpvwLXPglh9xM6XjO7XILIBOFpGjJYRow2q0QbVaINqtEHFQDQguR3xn4EyQO78BK52Bbp7yF2/OVp9jlafo9XnaPU5Wn2OVp/E13CjtQY0rIhuR5Bb/xOalyB13gK9nQCLc3LtYRitPkerz9Hqc7T6HK0+R6tPBlLBaDsCGmI0Pz+CYYiA0RQx2qAabVCNNqjwFVejZcRoGTFaRoyWEaNlBBGNutHCcrSwHC0sRwvL0cJytLBkIBqM1hqjtcZorTFaa4zWGqO1xmitwUAqGK0+R6vP0epztPocrT5Hq8/R6nO0+mQgE4y2I6ABBwDO5IMouIynVgAAAABJRU5ErkJggg==', 'base64')
for (const value of ['', token, '測試票券 🎟️', 'a\0b']) {
  assert.equal(sha1Hex(value), createHash('sha1').update(value).digest('hex'))
  assert.equal(md5Hex(value), createHash('md5').update(value).digest('hex'))
}
const booths = ['a', 'b', 'c', 'd'].map(slug => ({
  slug,
  significant: 1,
  displayText: { 'zh-TW': slug },
  imageUrl: 'data:image/png;base64,' + qrPng.toString('base64'),
  point: 1
}))
assert.deepEqual(shuffledBingo('1111')(token, booths).map(booth => booth.slug), ['c', 'd', 'a', 'b'])

const testConfig = {
  username: 'X-Test-Key',
  password: 'test-only',
  baseUrl: 'https://admin-test.invalid/api/',
  event_id: 'test',
  oneSignal: { app_id: 'test', api_key: 'test-only' },
  rewardConfig: 'https://admin-test.invalid/reward.json',
  bingoConfig: 'https://admin-test.invalid/bingo.json'
}
const outDir = await mkdtemp(join(tmpdir(), 'ccip-admin-smoke-'))
let server
let browser
let page
const requests = []
const errors = []
const unexpected = []
try {
  await build({
    logLevel: 'warn',
    plugins: [{
      name: 'test-config',
      enforce: 'pre',
      resolveId: id => id === '../../config.json' ? '\0test-config' : undefined,
      load: id => id === '\0test-config' ? `export default ${JSON.stringify(testConfig)}` : undefined
    }],
    build: { outDir, emptyOutDir: true }
  })
  server = await preview({ logLevel: 'warn', build: { outDir }, preview: { host: '127.0.0.1', port: 0 } })
  const url = server.resolvedUrls.local[0]
  browser = await chromium.launch({ executablePath: process.env.CHROME_BIN })
  const context = await browser.newContext({ colorScheme: 'dark' })
  const wasmRequests = []
  await context.route('**/*', async route => {
    const request = route.request()
    const target = new URL(request.url())
    if (target.origin === new URL(url).origin) {
      if (target.pathname.endsWith('.wasm')) wasmRequests.push(target.href)
      if (target.pathname.endsWith('favicon.ico')) return route.fulfill({ status: 204 })
      return route.continue()
    }
    if (target.hostname === 'fonts.googleapis.com') return route.fulfill({ contentType: 'text/css', body: '' })
    const respond = json => route.fulfill({
      json,
      headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': 'GET, POST, OPTIONS' }
    })
    if (target.href === 'https://portal.opass.app/events/test') return respond({ event_id: 'Upgrade test' })
    if (target.hostname !== 'admin-test.invalid') {
      unexpected.push(target.href)
      return route.abort()
    }
    if (request.method() === 'OPTIONS') return respond({})
    requests.push({ path: target.pathname, token: target.searchParams.get('token'), method: request.method(), body: request.postData() })
    switch (target.pathname) {
      case '/api/roles': return respond(['attendee'])
      case '/api/scenarios': return respond(['day1checkin'])
      case '/api/dashboard': return respond([{ role: 'attendee', logged: 1, total: 2, scenarios: [{ scenario: 'day1checkin', enabled: 2, used: 1 }] }])
      case '/api/dashboard/attendee': return respond([{ user_id: 'Demo Attendee', attr: {}, scenario: { day1checkin: { used: 1 } } }])
      case '/api/announcement': return respond(request.method() === 'POST' ? { status: 'OK' } : [])
      case '/api/use/day1checkin':
      case '/api/status': return respond({ user_id: 'Demo Attendee', first_use: 1, role: 'attendee', scenarios: [] })
      case '/api/event/puzzle/deliverers': return respond(booths)
      case '/api/event/puzzle': return respond({ user_id: 'Demo Attendee', valid: null, deliverers: booths.map(booth => ({ deliverer: booth.slug })) })
      case '/reward.json':
      case '/bingo.json': return respond({ booths, bingoPattern: '1111', title: { zh: '測試', en: 'Test' } })
      default:
        unexpected.push(target.href)
        return route.abort()
    }
  })
  // Upload is a fallback only when the camera API is unsupported.
  await context.addInitScript(() => {
    navigator.mediaDevices.getUserMedia = undefined
  })
  page = await context.newPage()
  page.setDefaultTimeout(15000)
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => {
    if (message.type() === 'error' || message.text().startsWith('[Vue warn]')) errors.push(message.text())
  })
  await page.goto(url)
  await page.getByText('OPass Admin - Upgrade test').waitFor()
  await page.locator('.highcharts-series').first().waitFor()
  assert.equal(await page.locator('.highcharts-background').first().evaluate(element => getComputedStyle(element).fill), 'rgb(255, 255, 255)')
  if (await page.locator('.v-navigation-drawer').evaluate(element => element.classList.contains('v-navigation-drawer--active'))) {
    await page.locator('.v-navigation-drawer__scrim').click()
  }
  await page.getByRole('button', { name: '切換選單' }).click()
  await page.locator('.v-navigation-drawer__scrim').click()
  await page.waitForFunction(() => !document.querySelector('.v-navigation-drawer').classList.contains('v-navigation-drawer--active'))
  await page.waitForFunction(() => {
    const series = document.querySelector('.highcharts-series')
    const point = series?.querySelector('.highcharts-point')
    const labels = document.querySelector('.highcharts-data-labels')
    return point?.getBBox().width > 30 && labels?.getBBox().width > 0
      && getComputedStyle(series).opacity === '1' && getComputedStyle(labels).opacity === '1'
  })
  await page.screenshot({ path: join(tmpdir(), 'ccip-admin-dashboard-light.png'), fullPage: true })
  await page.getByRole('button', { name: '切換選單' }).click()
  await page.getByRole('link', { name: '查詢', exact: true }).click()
  await page.getByText('Demo Attendee', { exact: true }).waitFor()

  await page.goto(url + '#/checkin')
  await page.locator('#CheckIn input[type=file]').waitFor()
  await page.locator('.v-select .v-field').click()
  await page.getByRole('option', { name: 'attendee - day1checkin' }).click()
  await page.getByLabel('Token', { exact: true }).fill('manual-token')
  await page.getByRole('button', { name: '手動 checkIn' }).click()
  await page.getByText('Demo Attendee', { exact: true }).waitFor()
  const upload = page.locator('input[type=file]')
  const scan = () => upload.setInputFiles({ name: 'token.png', mimeType: 'image/png', buffer: qrPng })
  await scan()
  await page.waitForFunction(value => document.querySelector('input[type=text]') !== null && [...document.querySelectorAll('input')].some(input => input.value === value), token)
  assert.ok(requests.some(request => request.path === '/api/use/day1checkin' && request.token === token))
  await upload.setInputFiles({ name: 'bad.png', mimeType: 'image/png', buffer: Buffer.from('not an image') })
  await page.locator('.qrcode-reader [role=alert]').waitFor()
  await upload.setInputFiles({ name: 'bad.txt', mimeType: 'text/plain', buffer: Buffer.from('not an image') })
  await page.getByText('請選擇圖片檔案', { exact: true }).waitFor()

  await page.goto(url + '#/bingo')
  await page.locator('#BingoGame input[type=file]').waitFor()
  await scan()
  await page.getByText('已達成 6 連線', { exact: true }).waitFor()
  assert.ok(requests.some(request => request.path === '/api/event/puzzle' && request.token === sha1Hex(token)))
  await page.goto(url + '#/reward')
  await page.locator('#RewardGame input[type=file]').waitFor()
  await scan()
  await page.getByText('Demo Attendee： 4', { exact: true }).waitFor()

  await page.goto(url + '#/announcement')
  await page.locator('#Announcement').waitFor()
  await page.locator('.v-select .v-field').click()
  await page.getByRole('option', { name: '全體', exact: true }).click()
  await page.getByPlaceholder('Msg(zh)').fill('測試公告')
  await page.getByPlaceholder('Msg(en)').fill('Test announcement')
  await page.getByRole('button', { name: 'Send!' }).click()
  await page.getByRole('cell', { name: 'Test announcement' }).waitFor()
  const announcement = requests.find(request => request.path === '/api/announcement' && request.method === 'POST')
  assert.deepEqual(new URLSearchParams(announcement.body).getAll('role[]'), ['attendee'])
  await page.goto(url + '#/push')
  await page.locator('#PushNotification').waitFor()
  await page.locator('.v-select .v-field').click()
  await page.getByRole('option', { name: '全體', exact: true }).click()

  // Denied permissions must keep the camera workflow, including a retry action.
  await page.evaluate(() => {
    navigator.mediaDevices.getUserMedia = async () => {
      throw new DOMException('Test camera denied', 'NotAllowedError')
    }
  })
  await page.goto(url + '#/reward')
  await page.getByText('請允許瀏覽器使用相機，再重新啟用相機。').waitFor()
  assert.equal(await page.locator('input[type=file]').count(), 0)
  assert.equal(await page.locator('.camera video').count(), 1)

  // Retry with a controlled video feed: blank, damaged QR, then readable QR.
  await page.evaluate(base64 => {
    navigator.mediaDevices.getUserMedia = async () => {
      const image = new Image()
      image.src = 'data:image/png;base64,' + base64
      await image.decode()
      const canvas = document.createElement('canvas')
      canvas.width = 640
      canvas.height = 360
      const drawing = canvas.getContext('2d')
      drawing.imageSmoothingEnabled = false
      const stream = canvas.captureStream(0)
      window.drawTestFrame = state => {
        drawing.fillStyle = '#fff'
        drawing.fillRect(0, 0, canvas.width, canvas.height)
        if (state !== 'blank') drawing.drawImage(image, 80, 40, 264, 264)
        if (state === 'damaged') drawing.fillRect(180, 140, 64, 64)
        stream.getVideoTracks()[0].requestFrame()
      }
      window.drawTestFrame('blank')
      window.testCameraTracks = stream.getTracks()
      return stream
    }
  }, qrPng.toString('base64'))
  await page.getByRole('button', { name: '重新啟用相機', exact: true }).click()
  await page.locator('.camera[data-state=scanning]').waitFor()
  assert.equal(await page.locator('input[type=file]').count(), 0)
  const puzzleRequests = () => requests.filter(request => request.path === '/api/event/puzzle').length
  const beforeDetection = puzzleRequests()
  await page.evaluate(() => window.drawTestFrame('damaged'))
  await page.locator('.camera[data-state=detected] polygon').waitFor()
  assert.equal(puzzleRequests(), beforeDetection, 'An undecoded candidate must not be submitted')
  assert.equal(await page.locator('.camera polygon').evaluate(element => getComputedStyle(element).stroke), 'rgb(255, 193, 7)')
  await page.evaluate(() => window.drawTestFrame('readable'))
  await page.locator('.camera[data-state=decoded] polygon').waitFor()
  await page.getByText('Demo Attendee： 4', { exact: true }).waitFor()
  assert.equal(await page.locator('.camera polygon').evaluate(element => getComputedStyle(element).stroke), 'rgb(0, 230, 118)')
  await page.screenshot({ path: join(tmpdir(), 'ccip-admin-scanner-outline.png'), fullPage: true })
  for (const viewport of [{ width: 1280, height: 720 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport)
    assert.ok(await page.locator('.camera').evaluate(element => {
      const video = element.querySelector('video')
      const rect = video.getBoundingClientRect()
      const svg = element.querySelector('svg')
      const point = svg.querySelector('polygon').points[0]
      const screen = new DOMPoint(point.x, point.y).matrixTransform(svg.getScreenCTM())
      const scale = Math.min(rect.width / video.videoWidth, rect.height / video.videoHeight)
      const expectedX = rect.x + (rect.width - video.videoWidth * scale) / 2 + point.x * video.videoWidth / svg.viewBox.baseVal.width * scale
      const expectedY = rect.y + (rect.height - video.videoHeight * scale) / 2 + point.y * video.videoHeight / svg.viewBox.baseVal.height * scale
      return Math.abs(screen.x - expectedX) < 1 && Math.abs(screen.y - expectedY) < 1
    }), 'The outline must follow the video across different aspect ratios')
  }
  await page.evaluate(() => window.drawTestFrame('blank'))
  await page.locator('.camera[data-state=scanning]').waitFor()
  assert.equal(await page.locator('.camera polygon').count(), 0, 'Old outlines must disappear when the code leaves the frame')
  await page.evaluate(() => {
    window.location.hash = '/status'
  })
  await page.locator('#Status').waitFor()
  await page.getByText('Demo Attendee', { exact: true }).waitFor()
  assert.ok(await page.evaluate(() => window.testCameraTracks.every(track => track.readyState === 'ended')))
  assert.ok(wasmRequests.length > 0, 'QR decoder must load the locally bundled WASM')
  assert.deepEqual(unexpected, [], 'Tests must not reach any real backend or external decoder')
  assert.deepEqual(errors, [], 'No browser errors or Vue warnings')
  console.log('Passed: hashes, Bingo ordering, all routes, forms, light charts, QR decoding, camera permissions/retry, detection outlines and cleanup')
} catch (error) {
  console.error({ errors, unexpected, requests })
  if (page) {
    console.error(await page.locator('body').innerText())
    await page.screenshot({ path: join(tmpdir(), 'ccip-admin-smoke-failure.png'), fullPage: true })
  }
  throw error
} finally {
  await browser?.close()
  if (server) await new Promise(resolve => server.httpServer.close(resolve))
  await rm(outDir, { recursive: true, force: true })
}
