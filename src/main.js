import { createApp } from 'vue'
import vuetify from './plugins/vuetify'
import App from './App.vue'
import { loadConfig } from './module/config'

async function start () {
  try {
    await loadConfig()
    const [{ default: router }, { default: Components }] = await Promise.all([
      import('./router'), import('./components/_index')
    ])
    const app = createApp(App)
      .use(router)
      .use(vuetify)

    Object.keys(Components).forEach(key => {
      app.component(key, Components[key])
    })

    app.mount('#app')
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
