<template>
  <v-navigation-drawer fixed temporary v-model="drawer">
    <v-list density="compact" nav>
      <v-list-item
        v-for="item in items"
        :key="item.title"
        :href="item.target && item.href"
        :to="!item.target ? item.href : null" router ripple
        :title="item.title"
        :prepend-icon="item.avatar"
      >
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>
<script>
export default {
  name: 'main-side',
  props: { value: Boolean },
  data () {
    return {
      drawer: null,
      items: [{
        title: '控制板',
        href: '/',
        avatar: 'dashboard'
      },
      {
        title: '查詢',
        href: 'status',
        avatar: 'search'
      },
      {
        title: '所有報到（含午餐）',
        href: 'checkin',
        avatar: 'check'
      },
      // {
      //   title: 'Lunch',
      //   href: 'lunch',
      //   avatar: 'check'
      // },
      {
        title: '公告',
        href: 'announcement',
        avatar: 'announcement'
      },
      {
        title: '推播',
        href: 'push',
        avatar: 'notifications'
      },
      // {
      //   title: '知識王',
      //   href: 'king',
      //   avatar: 'extension'
      // },
      {
        title: 'Bingo Game',
        href: 'bingo',
        avatar: 'extension'
      },
      {
        title: 'Reward Game',
        href: 'reward',
        avatar: 'extension'
      }
      ]
    }
  },
  watch: {
    drawer () {
      this.$emit('input', this.drawer)
    },
    value () {
      this.drawer = this.value
    }
  }
}
</script>
