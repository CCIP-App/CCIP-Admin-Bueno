import axios from 'axios'
import configs from '../../config.json'

const oneSignalConfig = {
  app_id: configs.oneSignal.app_id,
  api_key: configs.oneSignal.api_key
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
        'en': packet["en"],
        'zh-Hant': packet["zh-Hant"],
        'zh-Hans': packet["zh-Hans"]
      },
      'url': packet.uri
    })
  }
}
