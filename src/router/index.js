import Vue from 'vue';
import VueRouter from 'vue-router';
import authHelper from "@/helpers/authHelper";

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

//Password
const Password = () => import('@/views/passwords/Index')

//Users
const Users = () => import('@/views/users/Index')

//Backups
const Backups = () => import('@/views/backups/Index')

Vue.use(VueRouter)

const Router = new VueRouter({
    mode: 'hash', // https://router.vuejs.org/api/#mode
    linkActiveClass: 'active',
    scrollBehavior: () => ({y: 0}),
    routes: configRoutes(),
});

function configRoutes() {
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
                    component: Jobs,
                    meta: {
                        auth: true,
                    },
                },
                {
                    path: '/customers',
                    name: 'Customers',
                    component: Customers,
                    meta: {
                        auth: true,
                    },
                },
                {
                    path: '/methods',
                    name: 'Methods',
                    component: Methods,
                    meta: {
                        auth: true,
                    },
                },
                {
                    path: '/types',
                    name: 'Types',
                    component: Types,
                    meta: {
                        auth: true,
                    },
                },
                {
                    path: '/report',
                    name: 'Report',
                    component: Reports,
                    meta: {
                        auth: true,
                    },
                },
                {
                    path: '/chart-report',
                    name: 'Chart Report',
                    component: Charts,
                    meta: {
                        auth: true,
                    },
                },
                {
                    path: '/password',
                    name: 'Change Password',
                    component: Password,
                    meta: {
                        auth: true,
                    },
                },
                {
                    path: '/users',
                    name: 'Users',
                    component: Users,
                    meta: {
                        auth: true,
                    },
                },
                {
                    path: '/backups',
                    name: 'Backups',
                    component: Backups,
                    meta: {
                        auth: true,
                    },
                },
            ],
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

Router.beforeEach(async (to, from, next) => {
    if (to.matched.some(record => record.meta.auth)) {
        const logged = await authHelper.isLogged();
        if (!logged) {
            next({
                name: 'Login',
            });
        } else {
            next();
        }
    } else {
        next();
    }
});

export default Router;

