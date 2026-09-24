import { createApp } from 'vue'
import vuetify from './plugins/vuetify'
import App from './App.vue'
import router from './router'
import { loadConfig } from './module/config'

async function start () {
  try {
    await loadConfig()
    createApp(App)
      .use(router)
      .use(vuetify)
      .mount('#app')
  } catch {
    const root = document.querySelector('#app')
    root.setAttribute('role', 'alert')
    root.textContent = '後台載入失敗，請確認 config.json 設定後重新整理。'
    const retry = document.createElement('button')
    retry.textContent = '重新整理'
    retry.addEventListener('click', () => window.location.reload())
    root.append(retry)
  }
}

start()
