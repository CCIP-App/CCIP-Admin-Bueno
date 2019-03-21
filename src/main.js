import Vue from 'vue'
import './plugins/vuetify'
import App from './App.vue'
import router from './router'
import Components from './components/_index'

Vue.config.productionTip = false
Object.keys(Components).forEach(key => {
  Vue.component(key, Components[key])
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
