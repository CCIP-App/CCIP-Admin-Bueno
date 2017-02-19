import axios from 'axios'
import configs from '../../config.json'
const config = {
  baseURL: configs.baseUrl,
  timeout: 1000,
  auth: {
    username: configs.username,
    password: configs.password
  }
}

const client = axios.create(config)

export default {
  getDasboard: () => {
    return client('dashboard')
  },
  getStatus: (token) => {
    return client('status?token=' + token)
  }
}
