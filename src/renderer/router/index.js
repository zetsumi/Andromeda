import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/my-games/:id?',
      name: 'my-games',
      component: require('@/components/views/MyGames').default
    },
    {
      path: '/store',
      name: 'store',
      component: require('@/components/views/Store').default
    },
    {
      path: '/settings',
      name: 'settings',
      component: require('@/components/views/Settings').default
    },
    {
      path: '/monitor',
      name: 'monitor',
      component: require('@/components/views/Monitor').default
    },
    {
      path: '/about',
      name: 'about',
      component: require('@/components/views/About').default
    },
    {
      path: '*',
      redirect: '/my-games'
    }
  ]
})
