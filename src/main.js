import "regenerator-runtime";
import Vue from 'vue'
import App from './App'
import router from './router'
import CoreuiVue from '@coreui/vue'
import * as icons from '@coreui/icons'
import VueSweetalert2 from "vue-sweetalert2"
import store from './store'
import Vuelidate from "vuelidate";
import VueCookies from "vue-cookies";
import i18n from "@/helpers/i18n";

Vue.config.performance = true
Vue.use(CoreuiVue)
Vue.use(VueSweetalert2)
Vue.prototype.$log = console.log.bind(console)
Vue.use(Vuelidate)
Vue.use(VueCookies)

new Vue({
  el: '#app',
  i18n,
  router,
  store,
  icons,
  template: '<App/>',
  components: {
    App,
  }
})
