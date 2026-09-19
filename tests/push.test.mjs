import assert from 'node:assert/strict'
import test from 'node:test'
import { buildMessageRequest, validatePushConfig, validateEventContext, validateRoles, readSendResult, locales } from '../src/module/pushGateway.js'

const contents = { en: 'Lunch', 'zh-Hant': '午餐' }
const draft = { role: 'all', contents, uri: '' }
const request = buildMessageRequest(['audience', 'staff'], draft)
const context = { event_id: 'test', organizer_name: 'Test organizer', send_until: '2027-01-01T00:00:00Z', publishing_enabled: true }
const dispatches = request.roles.flatMap(role => locales.map(locale => ({ role, locale, topic: `opass-v1.test.${role}.${locale}`, fcm_message_id: 'projects/test/messages/example' })))
const accepted = { push_id: '00000000-0000-4000-8000-000000000001', event_id: 'test', status: 'accepted', dispatches }

test('concrete roles, English and Traditional Chinese bodies, optional HTTPS, Unicode length and forbidden routing', () => {
  assert.deepEqual(request, { roles: ['audience', 'staff'], contents })
  assert.deepEqual(locales, ['en', 'zh-Hant'])
  for (const value of [{ en: 'Lunch' }, { 'zh-Hant': '午餐' }, { ...contents, fr: 'Lunch' }, { ...contents, 'zh-Hant': '' }]) assert.throws(() => buildMessageRequest(['staff'], { ...draft, contents: value }))
  assert.deepEqual(buildMessageRequest(['audience', 'staff'], { ...draft, role: 'staff', uri: 'https://example.org/' }), { roles: ['staff'], contents, uri: 'https://example.org/' })
  for (const uri of ['https://example.org/議程', 'https://example.org/a%20b']) assert.equal(buildMessageRequest(['staff'], { ...draft, uri }).uri, uri)
  for (const roles of [[], ['all'], ['a', 'a'], ['a.b'], Array.from({ length: 9 }, (_, i) => `role${i}`)]) assert.throws(() => validateRoles(roles))
  for (const key of ['event_id', 'topic', 'token', 'fid', 'title', 'ttl', 'send_until']) assert.throws(() => buildMessageRequest(['staff'], { ...draft, [key]: 'injected' }))
  for (const uri of ['http://example.org', 'javascript:alert(1)', 'https://', 'https://example.org/' + 'a'.repeat(2048)]) assert.throws(() => buildMessageRequest(['staff'], { ...draft, uri }))
  for (const char of [' ', '\t', '\n', '\u0000', '\u007f', '\u009f', '\\']) assert.throws(() => buildMessageRequest(['staff'], { ...draft, uri: `https://example.org/a${char}b` }))
  for (const content of ['', ' ', '字'.repeat(1025)]) assert.throws(() => buildMessageRequest(['staff'], { ...draft, contents: { ...contents, en: content } }))
  assert.ok(buildMessageRequest(['staff'], { ...draft, contents: { ...contents, en: '🎟️'.repeat(512) } }))
})

test('rejects invalid Gateway origins and mismatched or disabled event contexts', () => {
  assert.ok(validatePushConfig({ gateway_url: 'https://push.example.org/', gateway_key: 'test-only' }))
  for (const gateway_key of ['', ' ', 'key with spaces', null]) assert.throws(() => validatePushConfig({ gateway_url: 'https://push.example.org', gateway_key }))
  for (const gateway_url of ['http://example.org', 'https://user:pass@example.org', 'https://example.org?key=x', 'https://example.org/v1']) assert.throws(() => validatePushConfig({ gateway_url, gateway_key: 'test-only' }))
  assert.deepEqual(validateEventContext(context, 'test'), context)
  assert.throws(() => validateEventContext(context, 'other'))
  assert.throws(() => validateEventContext({ ...context, publishing_enabled: false }, 'test'))
  assert.throws(() => validateEventContext({ ...context, send_until: 'not a date' }, 'test'))
})

test('complete accepted/incomplete responses versus missing, duplicated or malformed outcomes', () => {
  assert.equal(readSendResult({ status: 200, data: accepted }, 'test', request).kind, 'accepted')
  const incomplete = { push_id: accepted.push_id, event_id: 'test', status: 'incomplete', accepted: dispatches.slice(0, 1), unaccepted: dispatches.slice(1).map(({ fcm_message_id, ...dispatch }, i) => ({ ...dispatch, outcome: ['rejected', 'not_attempted', 'unknown'][i], code: 'TEST' })) }
  assert.equal(readSendResult({ status: 502, data: incomplete }, 'test', request).kind, 'incomplete')
  const allRejected = { ...incomplete, accepted: [], unaccepted: dispatches.map(({ fcm_message_id, ...dispatch }) => ({ ...dispatch, outcome: 'rejected', code: 'TEST' })) }
  assert.equal(readSendResult({ status: 502, data: allRejected }, 'test', request).kind, 'incomplete')
  for (const data of [null, 'lost response', { ...accepted, event_id: 'other' }, { ...accepted, dispatches: dispatches.slice(1) }, { ...accepted, dispatches: [...dispatches, dispatches[0]] }]) assert.equal(readSendResult({ status: 200, data }, 'test', request).kind, 'unknown')
  for (const [status, original, lists] of [[200, accepted, ['dispatches']], [502, incomplete, ['accepted', 'unaccepted']]]) {
    const data = { ...original, push_id: [original.push_id] }
    assert.equal(readSendResult({ status, data }, 'test', request).kind, 'unknown', `HTTP ${status} push_id`)
    for (const list of lists) {
      for (const field of ['role', 'locale']) {
        const data = structuredClone(original)
        data[list][0][field] = [data[list][0][field]]
        assert.equal(readSendResult({ status, data }, 'test', request).kind, 'unknown', `HTTP ${status} ${list} ${field}`)
      }
    }
  }
  for (const status of [400, 401, 403, 429, 500]) {
    assert.equal(readSendResult({ status, data: { code: 'TEST', message: 'private diagnostic' } }, 'test', request).kind, 'not_started')
    assert.equal(readSendResult({ status, data: {} }, 'test', request).kind, 'unknown')
  }
  assert.match(readSendResult({ status: 429, data: { code: 'RATE_LIMITED', message: 'test' }, headers: { 'retry-after': '60' } }, 'test', request).message, /60 秒/)
})
