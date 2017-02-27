import axios from 'axios'
import configs from '../../config.json'
const config = {
  baseURL: configs.baseUrl,
  timeout: 1000,
  headers: {
    [configs.username]: configs.password
  }
}

const client = axios.create(config)

export default {
  getDasboard: () => {
    return client.get('dashboard')
  },
  checkIn: (token) => {
    return client.get('use/day1checkin?token=' + token + '&StaffQuery=true').then((res) => res.data)
  },
  getStatus: (token) => {
    return client.get('status?token=' + token).then((res) => res.data)
  },
  getNickname: (token) => {
    return client.get('landing?token=' + token).then((res) => res.data.nickname)
  },
  getPuzzle: (pubToken) => {
    return client.get('event/puzzle?token=' + pubToken).then((res) => res.data)
  },
  revokPlayer: (token) => {
    return client.get('event/puzzle/revoke?token=' + token).then((res) => ({token: token, successful: res.data.status === 'OK'}))
  }
}
