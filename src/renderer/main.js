import Vue from 'vue'
import VueI18n from 'vue-i18n'
import axios from 'axios'
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import App from './App'
import router from './router'
import VueOffline from 'vue-offline'

import {library} from '@fortawesome/fontawesome-svg-core'
import {fas} from '@fortawesome/free-solid-svg-icons'
import {far} from '@fortawesome/free-regular-svg-icons'
import {fab} from '@fortawesome/free-brands-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
import '@/assets/goodgames/js/goodgames.js'

import VueDragscroll from 'vue-dragscroll'

import SettingsManager from '@/utils/SettingsManager'

import {store} from './store'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

Vue.use(VueOffline)

Vue.use(VueI18n)
const i18n = new VueI18n({
  locale: SettingsManager.getLocale(),
  fallbackLocale: 'en',
  messages: {
    de: require('@/i18n/de'),
    en: require('@/i18n/en'),
    fr: require('@/i18n/fr')
  }
})

Vue.use(BootstrapVue)
library.add(fas, far, fab)
Vue.component('font-awesome-icon', FontAwesomeIcon)

Vue.use(VueDragscroll)

// configure HTTP client
Vue.http.defaults.timeout = 3000

/* eslint-disable no-new */
new Vue({
  store,
  i18n,
  components: {
    App
  },
  router,
  template: '<App/>'
}).$mount('#app')
