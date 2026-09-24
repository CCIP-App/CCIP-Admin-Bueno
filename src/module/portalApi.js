import axios from 'axios'
import { config as configs } from './config'
const portalUrl = 'https://portal.opass.app/events/'
const config = {
  baseURL: portalUrl,
  timeout: 5000
}
const client = axios.create(config)

export default {
  getEvents () {
    return client.get('').then((res) => res.data)
  },
  getEvent (event) {
    return client.get(event).then((res) => res.data)
  },
  getCurrentEvent () {
    return this.getEvent(configs.event_id)
  }
}
