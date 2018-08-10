<template>
  <v-navigation-drawer :clipped="$vuetify.breakpoint.mdAndUp" fixed app v-model="drawer" v-bind:items="items">
    <v-list dense>
      <v-list-tile v-for="item in items" :key="item.title" :href="item.target && item.href" :to="!item.target ? item.href : null" router ripple>
        <v-list-tile-action>
          <v-icon>{{ item.avatar }}</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>{{ item.title }}</v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
    </v-list>
  </v-navigation-drawer>
</template>
<script>
  export default {
    name: 'main-side',
    props: { value: Boolean },
    data() {
      return {
        drawer: null,
        items: [{
          title: 'Dashboard',
          href: '/',
          avatar: 'dashboard'
        },
        {
          title: 'CheckIn',
          href: 'checkin',
          avatar: 'check'
        },
        {
          title: 'Status',
          href: 'status',
          avatar: 'account_box'
        },
        // {
        //   title: 'Lunch',
        //   href: 'lunch',
        //   avatar: 'check'
        // },
        {
          title: 'Annoucement',
          href: 'announcement',
          avatar: 'announcement'
        },
        {
          title: 'PushNotification',
          href: 'push',
          avatar: 'notifications'
        },
        {
          title: '大地遊戲',
          href: 'puzzle',
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
