import { createRouter, createWebHashHistory } from 'vue-router'

export default createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: () => import('@/views/Dashboard.vue') },
    { path: '/checkin', component: () => import('@/views/CheckIn.vue') },
    // { path: '/vipkit', component: () => import('@/views/VipKit.vue') },
    { path: '/status', component: () => import('@/views/Status.vue') },
    // { path: '/lunch', component: () => import('@/views/Lunch.vue') },
    { path: '/announcement', component: () => import('@/views/Announcement.vue') },
    { path: '/push', component: () => import('@/views/PushNotification.vue') },
    { path: '/reward', component: () => import('@/views/RewardGame.vue') },
    { path: '/bingo', component: () => import('@/views/BingoGame.vue') }
    // { path: '/king', component: () => import('@/views/KingGame.vue') }
    // { path: '/array', component: () => import('@/views/ArrayGame.vue') }
  ]
})
