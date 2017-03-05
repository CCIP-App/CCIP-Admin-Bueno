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
  getPuzzleDashboard: () => {
    return client.get('event/puzzle/dashboard').then((res) => res.data)
  },
  getPuzzle: (pubToken) => {
    return client.get('event/puzzle?token=' + pubToken).then((res) => res.data)
  },
  revokPlayer: (token) => {
    return client.get('event/puzzle/revoke?token=' + token).then((res) => ({token: token, successful: res.data.status === 'OK'}))
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
  }
}
