import { createApp } from 'vue'
import vuetify from './plugins/vuetify'
import App from './App.vue'
import router from './router'
import Components from './components/_index'

const app = createApp(App)
  .use(router)
  .use(vuetify)

Object.keys(Components).forEach(key => {
  app.component(key, Components[key])
})

app.mount('#app')

// new Vue({
//   router,
//   vuetify,
//   render: h => h(App)
// }).$mount('#app')
