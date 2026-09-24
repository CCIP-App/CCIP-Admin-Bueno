<template>
  <div id="PushNotification">
    <v-container fluid>
      <v-row>
        <v-col cols="12" :md="12" style="margin: 0 auto;">
          <v-card style="margin: 0 auto;">
            <v-card-text>
              <h5 class="ma-0">新增推播通知</h5>
              <v-select :items="options" placeholder="選擇對象" aria-label="選擇對象" v-model="draft.role" :disabled="locked" />
              <v-text-field type="text" placeholder="Msg(zh)" aria-label="正體中文" v-model="draft.contents['zh-Hant']" :disabled="locked" />
              <v-text-field type="text" placeholder="Msg(en)" aria-label="英文" v-model="draft.contents.en" :disabled="locked" />
              <v-text-field type="text" placeholder="URI(optional)" aria-label="URI" v-model="draft.uri" :disabled="locked" />
              <v-btn ripple color="info" @click="prepare" :disabled="locked || !roles" :loading="busy">Send!</v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      <v-alert v-if="error" closable type="warning" role="alert" class="mt-4" @click:close="error = ''">{{ error }}</v-alert>
      <v-alert v-if="result" closable :type="result.kind === 'accepted' ? 'success' : 'warning'" role="status" class="mt-4" @click:close="newMessage">
        {{ result.message }}
      </v-alert>
      <v-dialog v-model="confirming" persistent max-width="720" aria-labelledby="push-confirmation-title">
        <v-card v-if="confirmation">
          <v-card-title id="push-confirmation-title" class="text-wrap">確認推播：送出後無法收回</v-card-title>
          <v-card-text>
            <p>活動：{{ confirmation.eventContext.event_id }} · 主辦名稱：{{ confirmation.eventContext.organizer_name }}</p>
            <p>角色：{{ confirmation.request.roles.join('、') }}</p>
            <div v-for="locale in locales" :key="locale">
              <strong>{{ labels[locale] }}</strong><p class="push-content">{{ confirmation.request.contents[locale] }}</p>
            </div>
            <p v-if="confirmation.request.uri">URI：{{ confirmation.request.uri }}</p>
          </v-card-text>
          <v-card-actions>
            <v-btn @click="confirming = false" :disabled="busy">取消</v-btn>
            <v-btn color="primary" @click="send" :disabled="busy" :loading="busy">確認並送出</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { config as appConfig } from '../module/config'
import apiClient from '../module/apiClient'
import { buildMessageRequest, createGatewayClient, validatePushConfig, locales, validateRoles } from '../module/pushGateway'

const emptyDraft = () => ({ role: '', contents: { en: '', 'zh-Hant': '' }, uri: '' })

const labels = ref({ en: '英文', 'zh-Hant': '正體中文' })
const roles = ref(null)
const draft = ref(emptyDraft())
const busy = ref(false)
const confirming = ref(false)
const confirmation = ref(null)
const result = ref(null)
const error = ref('')

const options = computed(() => [{ value: 'all', title: '全體' }, ...(roles.value || []).map(role => ({ value: role, title: role }))])
const preventResend = computed(() => result.value && !['accepted', 'not_started'].includes(result.value.kind))
const locked = computed(() => busy.value || confirming.value || !!preventResend.value)

onMounted(async () => {
  try {
    roles.value = validateRoles(await apiClient.getRoles())
  } catch {
    error.value = '角色清單載入失敗或不合法，禁止發送。'
  }
  if (roles.value) await refresh()
})

async function checkPushSettings () {
  const eventId = appConfig.event_id
  const pushConfig = validatePushConfig({ gateway_url: appConfig.gateway_url, gateway_key: appConfig.gateway_key })
  const eventContext = await createGatewayClient(pushConfig).getEventContext(eventId)
  return { pushConfig, eventContext, eventId }
}

async function refresh () {
  busy.value = true
  error.value = ''
  try {
    await checkPushSettings()
  } catch (err) {
    error.value = err.message
  } finally {
    busy.value = false
  }
}

async function prepare () {
  if (locked.value || !roles.value) return
  busy.value = true
  error.value = ''
  result.value = null
  try {
    const request = buildMessageRequest(roles.value, draft.value)
    confirmation.value = { ...await checkPushSettings(), request }
    confirming.value = true
  } catch (err) {
    error.value = err.message
  } finally {
    busy.value = false
  }
}

async function send () {
  if (busy.value || !confirming.value) return
  busy.value = true
  error.value = ''
  try {
    const fresh = await checkPushSettings()
    const before = confirmation.value
    if (JSON.stringify(fresh) !== JSON.stringify({ pushConfig: before.pushConfig, eventContext: before.eventContext, eventId: before.eventId })) {
      throw new Error('推播設定或中央活動資料已變更，請重新確認。')
    }
    result.value = await createGatewayClient(fresh.pushConfig).send(fresh.eventId, before.request)
    if (result.value.kind === 'accepted') draft.value = { ...emptyDraft(), role: draft.value.role }
  } catch (err) {
    error.value = err.message
  } finally {
    busy.value = false
    confirming.value = false
    confirmation.value = null
  }
}

async function newMessage () {
  if (preventResend.value) draft.value = emptyDraft()
  result.value = null
  await refresh()
}
</script>

<style scoped>
.push-content { white-space: pre-wrap; overflow-wrap: anywhere; }
</style>
