export let config

export async function loadConfig () {
  const response = await fetch(`${import.meta.env.BASE_URL}config.json`, {
    cache: 'no-store', signal: AbortSignal.timeout(10000)
  })
  if (!response.ok) throw new Error('設定載入失敗。')
  const data = await response.json()
  const fields = ['username', 'password', 'baseUrl', 'event_id', 'rewardConfig', 'bingoConfig', 'gateway_url', 'gateway_key']
  if (!data || typeof data !== 'object' || Array.isArray(data)
    || fields.some(field => typeof data[field] !== 'string')) throw new Error('設定格式無效。')
  config = Object.freeze(data)
}
