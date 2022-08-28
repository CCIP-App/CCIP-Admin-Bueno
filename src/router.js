/* eslint-disable no-unused-vars */
import { createRouter, createWebHistory } from 'vue-router'

import Dashboard from '@/views/Dashboard.vue'
import CheckIn from '@/views/CheckIn.vue'
// import VipKit from '@/views/VipKit.vue'
import Status from '@/views/Status.vue'
import Lunch from '@/views/Lunch.vue'
import Announcement from '@/views/Announcement.vue'
import PushNotification from '@/views/PushNotification.vue'
import RewardGame from '@/views/RewardGame.vue'
import BingoGame from '@/views/BingoGame.vue'
import Coupon from '@/views/Coupon.vue'
import KingGame from '@/views/KingGame.vue'

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: Dashboard },
    { path: '/checkin', component: CheckIn },
    // { path: '/vipkit', component: VipKit },
    { path: '/status', component: Status },
    // { path: '/lunch', component: Lunch },
    { path: '/announcement', component: Announcement },
    { path: '/push', component: PushNotification },
    { path: '/reward', component: RewardGame },
    { path: '/bingo', component: BingoGame }
    // { path: '/king', component: KingGame }
    // { path: '/array', component: ArrayGame }
  ]
})
