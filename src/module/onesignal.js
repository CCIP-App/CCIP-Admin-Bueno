import axios from 'axios'
import configs from '../../config.json'

const oneSignalConfig = {
  app_id: configs.oneSignal.app_id,
  api_key: configs.oneSignal.api_key,
  event_id: configs.oneSignal.event_id
}

const axiosConfig = {
  baseURL: 'https://onesignal.com/api/v1/',
  headers: {
    Authorization: 'Basic ' + oneSignalConfig.api_key,
    'Content-Type': 'application/json'
  }
}

const client = axios.create(axiosConfig)

export default {
  createNotification: (packet) => {
    return client.post('notifications', {
      'app_id': oneSignalConfig.app_id,
      'included_segments': packet.target,
      'contents': {
        'en': packet.en,
        'zh-Hant': packet.en,
        'zh-Hans': packet.en
      },
      'url': packet.uri
    })
  },
  createNotificationWithTagFilter: (packet) => {
    let filters = [
      { 'field': 'tag', 'key': 'event_id', 'relation': '=', 'value': oneSignalConfig.event_id }
    ]

    if (packet.target !== 'all') {
      filters.push({ 'operator': 'AND' })
      filters.push({ 'field': 'tag', 'key': 'type', 'relation': '=', 'value': packet.target })
    }

    return client.post('notifications', {
      'app_id': oneSignalConfig.app_id,
      'filters': filters,
      'contents': {
        'en': packet.en,
        'zh-Hant': packet.en,
        'zh-Hans': packet.en
      },
      'url': packet.uri
    })
  }
}
