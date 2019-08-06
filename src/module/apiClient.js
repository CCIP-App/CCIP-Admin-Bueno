import axios from 'axios'
import configs from '../../config.json'
const config = {
  baseURL: configs.baseUrl,
  timeout: 5000,
  headers: {
    [configs.username]: configs.password
  }
}

const noHeaderConfig = {
  baseURL: configs.baseUrl,
  timeout: 5000
}

const client = axios.create(config)
const publicClient = axios.create(noHeaderConfig)

export default {
  getDasboard: () => {
    return client.get('dashboard')
  },
  useScenarios: (scenarios, token) => {
    return client.get(`use/${scenarios}?token=${token}&staffQuery=true`).then((res) => res.data)
  },
  allScenarios: (type) => {
    return client.get('scenarios?type=' + type).then((res) => res.data)
  },
  getAllTypeScenarios: (type) => {
    return client.get('dashboard/' + type).then((res) => res.data)
  },
  getStatus: (token) => {
    return client.get('status?token=' + token).then((res) => res.data)
  },
  getNickname: (token) => {
    return client.get('landing?token=' + token).then((res) => res.data.nickname)
  },
  getPuzzle: (pubToken) => {
    return publicClient.get('event/puzzle?token=' + pubToken).then((res) => res.data)
  },
  revokPlayer: (token) => {
    return client.get('event/puzzle/revoke?token=' + token).then((res) => ({ token: token, successful: res.data.status === 'OK' }))
  },
  addAnnouncement: (announcement) => {
    let params = new URLSearchParams()
    params.append('msg_zh', announcement.msg_zh)
    params.append('msg_en', announcement.msg_en)
    params.append('uri', announcement.uri)
    return client.post('announcement', params).then((res) => res.data)
  },
  getAnnouncement: () => {
    return client.get('announcement').then((res) => res.data)
  },
  revokeCoupon: (token) => {
    return client.get('event/puzzle/coupon?token=').then((res) => res.data)
  },
  getBoothList: () => {
    return publicClient('/event/puzzle/deliverers').then((res) => res.data)
  }
}
