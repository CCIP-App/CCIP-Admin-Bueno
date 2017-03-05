import Vue from 'vue'
import Router from 'vue-router'

import Dashboard from '../views/Dashboard.vue'
import CheckIn from '../views/CheckIn.vue'
import Announcement from '../views/Announcement.vue'
import PushNoti from '../views/PushNoti.vue'
import Puzzle from '../views/Puzzle.vue'
import Coupon from '../views/Coupon.vue'

Vue.use(Router)

export default new Router({
  routes: [
    { path: '/', component: Dashboard },
    { path: '/checkin', component: CheckIn },
    { path: '/announcement', component: Announcement },
    { path: '/push', component: PushNoti },
    { path: '/puzzle', component: Puzzle },
    { path: '/coupon', component: Coupon }
  ]
})
