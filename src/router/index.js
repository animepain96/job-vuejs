import Vue from 'vue'
import Router from 'vue-router'

// Containers
const TheContainer = () => import('@/containers/TheContainer')

//Job
const Jobs = () => import('@/views/jobs/Index')

//Customers
const Customers = () => import('@/views/customers/Index')

//Methods
const Methods = () => import('@/views/methods/Index')

//Types
const Types = () => import('@/views/types/Index')

//Report
const Reports = () => import('@/views/reports/Index')

//Charts
const Charts = () => import('@/views/charts/Index')

//NotFound
const NotFound = () => import('@/views/pages/Page404')

//Login
const Login = () => import('@/views/pages/Login')

Vue.use(Router)

export default new Router({
  mode: 'history', // https://router.vuejs.org/api/#mode
  linkActiveClass: 'active',
  scrollBehavior: () => ({ y: 0 }),
  routes: configRoutes()
})

function configRoutes () {
  return [
    {
      path: '/',
      redirect: '/jobs',
      name: 'Home',
      component: TheContainer,
      children: [
        {
          path: 'jobs',
          name: 'Jobs',
          component: Jobs
        },
        {
          path: '/customers',
          name: 'Customers',
          component: Customers,
        },
        {
          path: '/methods',
          name: 'Methods',
          component: Methods,
        },
        {
          path: '/types',
          name: 'Types',
          component: Types,
        },
        {
          path: '/report',
          name: 'Report',
          component: Reports,
        },
        {
          path: '/chart-report',
          name: 'Chart Report',
          component: Charts,
        },
      ]
    },
    {
      path: '/404',
      name: 'Page Not Found',
      component: NotFound,
    },
    {
      path: '/login',
      name: 'Login',
      component: Login,
    },
    {
      path: '*',
      redirect: '/404',
    },
  ]
}

