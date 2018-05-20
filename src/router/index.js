import Vue from 'vue'
import Router from 'vue-router'

import Dashboard from '../views/Dashboard.vue'
import CheckIn from '../views/CheckIn.vue'
import Announcement from '../views/Announcement.vue'
import PushNoti from '../views/PushNoti.vue'
import Puzzle from '../views/Puzzle.vue'
import Coupon from '../views/Coupon.vue'
import Lunch from '../views/Lunch.vue'
import KingGame from '../views/KingGame.vue'

Vue.use(Router)

export default new Router({
  routes: [
    { path: '/', component: Dashboard },
    { path: '/checkin', component: CheckIn },
    { path: '/lunch', component: Lunch },
    { path: '/announcement', component: Announcement },
    { path: '/push', component: PushNoti },
    // { path: '/king', component: KingGame }
    { path: '/puzzle', component: Puzzle }
  ]
})
