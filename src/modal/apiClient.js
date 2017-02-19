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
    console.log('client', client)
    return client('dashboard')
  },
  getStatus: (token) => {
    return client('status?token=' + token)
  }
}
