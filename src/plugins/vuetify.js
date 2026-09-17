import { createVuetify } from 'vuetify'
import { zhHant } from 'vuetify/locale'
import colors from 'vuetify/util/colors'
import 'vuetify/styles'
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import { aliases, md } from 'vuetify/iconsets/md'

export default createVuetify({
  theme: {
    defaultTheme: 'ccip',
    themes: {
      ccip: {
        dark: false,
        colors: {
          primary: '#4d256f',
          secondary: colors.grey.darken3,
          accent: colors.blue.accent1,
          info: colors.blue.base,
          warning: colors.amber.base,
          error: colors.red.base,
          success: colors.green.base
        }
      }
    }
  },
  icons: {
    defaultSet: 'md',
    aliases,
    sets: {
      md
    }
  },
  locale: {
    locales: { zhHant },
    locale: 'zhHant'
  }
})
