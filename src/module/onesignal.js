import axios from 'axios'
import configs from '../../config.json'
import apiClient from './apiClient'

const oneSignalConfig = {
  app_id: configs.oneSignal.app_id,
  api_key: configs.oneSignal.api_key,
  event_id: configs.event_id
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
      app_id: oneSignalConfig.app_id,
      included_segments: packet.target,
      contents: {
        en: packet.en,
        'zh-Hant': packet['zh-Hant'],
        'zh-Hans': packet['zh-Hans']
      },
      url: packet.uri
    })
  },
  createNotificationWithTagFilter: async (packet) => {
    const filters = []

    if (packet.target === 'all') {
      await apiClient.getRoles().then((roles) => {
        roles.forEach((role) => {
          if (filters.length > 0) {
            filters.push({ operator: 'OR' })
          }
          filters.push({ field: 'tag', key: `${oneSignalConfig.event_id}${role}`, relation: 'exists' })
        })
      })
    } else {
      filters.push({ field: 'tag', key: `${oneSignalConfig.event_id}${packet.target}`, relation: 'exists' })
    }

    return client.post('notifications', {
      app_id: oneSignalConfig.app_id,
      filters: filters,
      contents: {
        en: packet.en,
        'zh-Hant': packet['zh-Hant'],
        'zh-Hans': packet['zh-Hans']
      },
      url: packet.uri
    })
  }
}
