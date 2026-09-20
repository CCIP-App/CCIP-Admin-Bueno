import axios from 'axios'

export const locales = ['en', 'zh-Hant']
const identifier = /^[A-Za-z0-9_-]{1,64}$/
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const exactKeys = (value, keys) => value && typeof value === 'object' && !Array.isArray(value)
  && Object.keys(value).every(key => keys.includes(key)) && keys.every(key => Object.hasOwn(value, key))
const nonempty = value => typeof value === 'string' && value.trim().length > 0

export function validateRoles (roles) {
  if (!Array.isArray(roles) || roles.length < 1 || roles.length > 8
    || new Set(roles).size !== roles.length
    || roles.some(role => typeof role !== 'string' || !identifier.test(role) || role === 'all')) {
    throw new Error('角色清單須包含 1–8 個不重複的具體角色，且不得包含 all。')
  }
  return [...roles]
}

export function buildMessageRequest (roles, draft) {
  validateRoles(roles)
  if (!exactKeys(draft, ['role', 'contents', 'uri']) || !exactKeys(draft.contents, locales)) throw new Error('推播欄位不符合契約。')
  const selected = draft.role === 'all' ? roles : roles.filter(role => role === draft.role)
  validateRoles(selected)
  if (locales.some(locale => !nonempty(draft.contents[locale]) || [...draft.contents[locale]].length > 1024)) {
    throw new Error('英文及正體中文皆須填寫，每種最多 1024 個字元。')
  }
  const request = { roles: [...selected], contents: { ...draft.contents } }
  if (typeof draft.uri !== 'string') throw new Error('連結須為 HTTPS URL。')
  if (draft.uri) {
    let url
    try {
      url = new URL(draft.uri)
    } catch { /* Validated below. */ }
    // eslint-disable-next-line no-control-regex -- Match Gateway's rejection of raw controls before URL normalization.
    if (!url || !draft.uri.startsWith('https://') || !url.hostname || [...draft.uri].length > 2048 || /[\u0000-\u0020\u007f-\u009f\\]/u.test(draft.uri)) throw new Error('連結須為 HTTPS URL，最多 2048 個字元。')
    request.uri = draft.uri
  }
  return request
}

export function validatePushConfig (data) {
  if (!exactKeys(data, ['gateway_url', 'gateway_key']) || !nonempty(data.gateway_key)
    || /\s/.test(data.gateway_key) || typeof data.gateway_url !== 'string') throw new Error('推播設定無效。')
  let url
  try {
    url = new URL(data.gateway_url)
  } catch {
    throw new Error('推播設定無效。')
  }
  const loopback = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)
  if ((url.protocol !== 'https:' && !(loopback && url.protocol === 'http:'))
    || url.username || url.password || url.search || url.hash || url.pathname !== '/') throw new Error('推播設定無效。')
  return { gateway_url: url.origin, gateway_key: data.gateway_key }
}

export function validateEventContext (data, eventId) {
  if (!exactKeys(data, ['event_id', 'organizer_name', 'send_until', 'publishing_enabled'])
    || typeof data.event_id !== 'string' || !identifier.test(data.event_id) || !nonempty(data.organizer_name)
    || [...data.organizer_name].some(char => char.charCodeAt(0) < 32 || (char.charCodeAt(0) >= 127 && char.charCodeAt(0) <= 159))
    || typeof data.send_until !== 'string' || !/(Z|[+-]\d{2}:\d{2})$/.test(data.send_until)
    || !Number.isFinite(Date.parse(data.send_until)) || typeof data.publishing_enabled !== 'boolean') throw new Error('Gateway context 回應不完整，禁止發送。')
  if (data.event_id !== eventId) throw new Error('Gateway 活動與 Admin 設定不符，禁止發送。')
  if (!data.publishing_enabled) throw new Error('活動已停發；輪替 key 不會延長期限。')
  return data
}

const unknownSendResult = () => ({ kind: 'unknown', message: '結果未知，可能已有部分送出。請勿重送。' })
const preDispatchErrors = {
  400: '內容或請求格式不合法', 401: '活動 key 無效或已撤銷',
  403: '來源不允許或活動已停發', 429: '超過活動發送頻率限制', 500: 'Gateway 設定或內容保存失敗'
}

export function readSendResult (response, eventId, request) {
  const { status, data, headers } = response
  if (preDispatchErrors[status] && exactKeys(data, ['code', 'message']) && nonempty(data.message) && nonempty(data.code)) {
    const reason = data.code === 'ORIGIN_NOT_ALLOWED'
      ? '此 Admin origin 不允許發送'
      : data.code === 'EVENT_PUBLISHING_EXPIRED' ? '活動已停發；輪替 key 不會延長期限' : preDispatchErrors[status]
    const retry = headers?.['retry-after']
    return { kind: 'not_started', message: `${reason}。通知尚未送出。${status === 429 && /^\d+$/.test(retry) ? `請至少等候 ${retry} 秒；不會自動重送。` : ''}` }
  }
  const allAccepted = status === 200
  if (![200, 502].includes(status) || !exactKeys(data, allAccepted
    ? ['push_id', 'event_id', 'status', 'dispatches']
    : ['push_id', 'event_id', 'status', 'accepted', 'unaccepted'])
  || typeof data.push_id !== 'string' || !uuid.test(data.push_id) || data.event_id !== eventId || data.status !== (allAccepted ? 'accepted' : 'incomplete')) return unknownSendResult()
  const acceptedDispatches = allAccepted ? data.dispatches : data.accepted
  const unacceptedDispatches = allAccepted ? [] : data.unaccepted
  if (!Array.isArray(acceptedDispatches) || !Array.isArray(unacceptedDispatches) || (!allAccepted && unacceptedDispatches.length === 0)) return unknownSendResult()
  const remainingTopics = new Set(request.roles.flatMap(role => locales.map(locale => `opass-v1.${eventId}.${role}.${locale}`)))
  const counts = { accepted: acceptedDispatches.length, rejected: 0, not_attempted: 0, unknown: 0 }
  for (const [dispatches, isAccepted] of [[acceptedDispatches, true], [unacceptedDispatches, false]]) {
    for (const item of dispatches) {
      if (!exactKeys(item, isAccepted ? ['role', 'locale', 'topic', 'fcm_message_id'] : ['role', 'locale', 'topic', 'outcome', 'code'])
        || typeof item.role !== 'string' || typeof item.locale !== 'string'
        || item.topic !== `opass-v1.${eventId}.${item.role}.${item.locale}` || !remainingTopics.delete(item.topic)
        || (isAccepted ? !nonempty(item.fcm_message_id) : !['rejected', 'not_attempted', 'unknown'].includes(item.outcome) || !nonempty(item.code))) return unknownSendResult()
      if (!isAccepted) counts[item.outcome]++
    }
  }
  if (remainingTopics.size) return unknownSendResult()
  return {
    kind: allAccepted ? 'accepted' : 'incomplete', pushId: data.push_id,
    message: allAccepted
      ? '通知已送出。是否收到通知仍取決於使用者的裝置與通知設定。'
      : `已送出 ${counts.accepted} 項；失敗 ${counts.rejected} 項、未送出 ${counts.not_attempted} 項、結果不明 ${counts.unknown} 項。請勿重送。`
  }
}

export function createGatewayClient (pushConfig) {
  const { gateway_url: baseURL, gateway_key: key } = validatePushConfig(pushConfig)
  const client = axios.create({
    baseURL, timeout: 60000, withCredentials: false, validateStatus: () => true,
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }
  })
  return {
    async getEventContext (eventId) {
      let response
      try {
        response = await client.get('/v1/context')
      } catch {
        throw new Error('無法核對 Gateway context，禁止發送。')
      }
      if (response.status !== 200) throw new Error(`Gateway context 查詢失敗（${response.status}），禁止發送。`)
      return validateEventContext(response.data, eventId)
    },
    async send (eventId, request) {
      try {
        return readSendResult(await client.post('/v1/messages', request), eventId, request)
      } catch {
        return unknownSendResult()
      }
    }
  }
}
