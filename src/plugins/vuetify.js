import Vue from 'vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
import zhHant from 'vuetify/es5/locale/zh-Hant'
import colors from 'vuetify/es5/util/colors'

Vue.use(Vuetify, {
  theme: {
    primary: '#3F7D41',
    secondary: colors.grey.darken3,
    accent: colors.blue.accent1,
    info: colors.blue.base,
    warning: colors.amber.base,
    error: colors.red.base,
    success: colors.green.base
  },
  options: {
    customProperties: true
  },
  iconfont: 'md',
  lang: {
    locales: { zhHant },
    current: 'zh-Hant'
  }
})
