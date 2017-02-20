<template>
  <v-sidebar id="mainsidebar" v-bind:items="items" ripple router>
  </v-sidebar>
</template>
<script>
  export default {
    name: 'main-side',
    data() {
      return {
        items: [{
          title: 'Dashboard',
          href: '/dashboard',
          avatar: 'dashboard'
        },
        {
          title: 'CheckIn',
          href: '/checkin',
          avatar: 'check'
        },
        {
          title: 'Annoucement',
          href: '/announcement',
          avatar: 'announcement'
        },
        {
          title: 'PushNotification',
          href: '/push',
          avatar: 'notifications'
        },
        {
          title: 'Puzzle',
          href: '/puzzle',
          avatar: 'games'
        }
        ]
      }
    }
  }
</script>
<style lang="stylus">
  @import '../stylus/settings/_variables'

  .sidebar
    background-color: #fff

    &__links
      margin: 0rem
      display: flex
      justify-content: center
      align-items: center

      a
        text-align: center
        text-decoration: none
        margin: 0 0rem

        img
          height: 25px

        i
          padding: 0

  .list
    margin: 0 0rem !important

    .list__tile
      color: $grey.darken-3

    .icon
      color: $grey.darken-3 !important

  .sidebar
    position: fixed;
    top: 4rem
    left: 0px
    z-index: 5
    @media screen and (min-width: $grid-breakpoints.sm)
      min-width:230px
</style>
