import 'core-js/stable'
import Vue from 'vue'
import App from './App'
import router from './router'
import CoreuiVue from '@coreui/vue'
import * as icons from '@coreui/icons'
import VueSweetalert2 from "vue-sweetalert2"
import store from './store'
import Vuelidate from "vuelidate";

Vue.config.performance = true
Vue.use(CoreuiVue)
Vue.use(VueSweetalert2)
Vue.prototype.$log = console.log.bind(console)
Vue.use(Vuelidate)

new Vue({
  el: '#app',
  router,
  store,
  icons,
  template: '<App/>',
  components: {
    App,
  }
})
