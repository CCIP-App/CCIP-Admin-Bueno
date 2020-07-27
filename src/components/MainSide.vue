<template>
  <v-navigation-drawer :clipped="$vuetify.breakpoint.mdAndUp" fixed app v-model="drawer" v-bind:items="items">
    <v-list dense>
      <v-list-item v-for="item in items" :key="item.title" :href="item.target && item.href" :to="!item.target ? item.href : null" router ripple>
        <v-list-item-action>
          <v-icon>{{ item.avatar }}</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item-content>
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
        title: '控制版',
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
<style lang="stylus">
  // @import '../stylus/settings/_variables'

  // .sidebar
  //   background-color: #fff

  //   &__links
  //     margin: 0rem
  //     display: flex
  //     justify-content: center
  //     align-items: center

  //     a
  //       text-align: center
  //       text-decoration: none
  //       margin: 0 0rem

  //       img
  //         height: 25px

  //       i
  //         padding: 0

  // .list
  //   margin: 0 0rem !important

  //   .list__tile
  //     color: $grey.darken-3

  //   .icon
  //     color: $grey.darken-3 !important

  // .sidebar
  //   position: fixed;
  //   top: 4rem
  //   left: 0px
  //   z-index: 5
  //   @media screen and (min-width: $grid-breakpoints.sm)
  //     min-width:230px
</style>
