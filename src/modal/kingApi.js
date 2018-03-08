import axios from 'axios'
const config = {
  baseURL: 'https://king-api.sitcon.party',
  timeout: 1000
}


const client = axios.create(config)

export default {
  getUser: (token) => {
    return client.get('getUser?token='+token)
  },
  getPrizes: () => {
    return client.get('getPrizes')
  },
  convert: (prizeId, token) => {
    return client.post('convert', { prizeId:prizeId, token:token })
  }
}
