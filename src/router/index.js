import Vue from 'vue'
import Router from 'vue-router'

import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import CheckIn from '../views/CheckIn.vue'
import Announcement from '../views/Announcement.vue'
import PushNoti from '../views/PushNoti.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    { path: '/', component: Login },
    { path: '/dashboard', component: Dashboard },
    { path: '/checkin', component: CheckIn },
    { path: '/announcement', component: Announcement },
    { path: '/push', component: PushNoti }
  ]
})
