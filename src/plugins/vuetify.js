import Vue from 'vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
import zhHant from 'vuetify/es5/locale/zh-Hant'
import colors from 'vuetify/es5/util/colors'

Vue.use(Vuetify)

export default new Vuetify({
  theme: {
    themes: {
      light: {
        primary: '#4d256f',
        secondary: colors.grey.darken3,
        accent: colors.blue.accent1,
        info: colors.blue.base,
        warning: colors.amber.base,
        error: colors.red.base,
        success: colors.green.base
      }
    }
  },
  options: {
    customProperties: true
  },
  icons: {
    iconfont: 'mdiSvg' // 'mdi' || 'mdiSvg' || 'md' || 'fa' || 'fa4'
  },
  lang: {
    locales: { zhHant },
    current: 'zhHant'
  }
})
