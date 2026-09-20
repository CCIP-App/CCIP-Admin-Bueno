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

<script>
import appConfig from '../../config.json'
import apiClient from '../module/apiClient'
import { buildMessageRequest, createGatewayClient, validatePushConfig, locales, validateRoles } from '../module/pushGateway'

const emptyDraft = () => ({ role: '', contents: { en: '', 'zh-Hant': '' }, uri: '' })

export default {
  name: 'PushNotification',
  data () {
    return {
      locales, labels: { en: '英文', 'zh-Hant': '正體中文' },
      roles: null, draft: emptyDraft(), busy: false,
      confirming: false, confirmation: null, result: null, error: ''
    }
  },
  computed: {
    options () { return [{ value: 'all', title: '全體' }, ...(this.roles || []).map(role => ({ value: role, title: role }))] },
    preventResend () { return this.result && !['accepted', 'not_started'].includes(this.result.kind) },
    locked () { return this.busy || this.confirming || !!this.preventResend }
  },
  async mounted () {
    try {
      this.roles = validateRoles(await apiClient.getRoles())
    } catch {
      this.error = '角色清單載入失敗或不合法，禁止發送。'
    }
    if (this.roles) await this.refresh()
  },
  methods: {
    async checkPushSettings () {
      const eventId = appConfig.event_id
      const pushConfig = validatePushConfig({ gateway_url: appConfig.gateway_url, gateway_key: appConfig.gateway_key })
      const eventContext = await createGatewayClient(pushConfig).getEventContext(eventId)
      return { pushConfig, eventContext, eventId }
    },
    async refresh () {
      this.busy = true
      this.error = ''
      try {
        await this.checkPushSettings()
      } catch (error) {
        this.error = error.message
      } finally {
        this.busy = false
      }
    },
    async prepare () {
      if (this.locked || !this.roles) return
      this.busy = true
      this.error = ''
      this.result = null
      try {
        const request = buildMessageRequest(this.roles, this.draft)
        this.confirmation = { ...await this.checkPushSettings(), request }
        this.confirming = true
      } catch (error) {
        this.error = error.message
      } finally {
        this.busy = false
      }
    },
    async send () {
      if (this.busy || !this.confirming) return
      this.busy = true
      this.error = ''
      try {
        const fresh = await this.checkPushSettings()
        const before = this.confirmation
        if (JSON.stringify(fresh) !== JSON.stringify({ pushConfig: before.pushConfig, eventContext: before.eventContext, eventId: before.eventId })) {
          throw new Error('推播設定或中央活動資料已變更，請重新確認。')
        }
        this.result = await createGatewayClient(fresh.pushConfig).send(fresh.eventId, before.request)
        if (this.result.kind === 'accepted') this.draft = { ...emptyDraft(), role: this.draft.role }
      } catch (error) {
        this.error = error.message
      } finally {
        this.busy = false
        this.confirming = false
        this.confirmation = null
      }
    },
    async newMessage () {
      if (this.preventResend) this.draft = emptyDraft()
      this.result = null
      await this.refresh()
    }
  }
}
</script>

<style scoped>
.push-content { white-space: pre-wrap; overflow-wrap: anywhere; }
</style>
