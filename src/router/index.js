import Vue from 'vue';
import VueRouter from 'vue-router';
import authHelper from "@/helpers/authHelper";
import {toastAlert} from "@/helpers/alert";
import i18n from "@/helpers/i18n";

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
            meta: {
                label: 'routes.home'
            },
            children: [
                {
                    path: 'jobs',
                    name: 'Jobs',
                    component: Jobs,
                    meta: {
                        auth: true,
                        label: 'routes.jobs',
                    },
                },
                {
                    path: '/customers',
                    name: 'Customers',
                    component: Customers,
                    meta: {
                        auth: true,
                        //label: 'routes.customers',
                    },
                },
                {
                    path: '/methods',
                    name: 'Methods',
                    component: Methods,
                    meta: {
                        auth: true,
                        label: 'routes.methods',
                    },
                },
                {
                    path: '/types',
                    name: 'Types',
                    component: Types,
                    meta: {
                        auth: true,
                        label: 'routes.types',
                    },
                },
                {
                    path: '/report',
                    name: 'Report',
                    component: Reports,
                    meta: {
                        auth: true,
                       label: 'routes.report',
                    },
                },
                {
                    path: '/chart-report',
                    name: 'Chart Report',
                    component: Charts,
                    meta: {
                        auth: true,
                        label: 'routes.chart_report',
                    },
                },
                {
                    path: '/password',
                    name: 'Password',
                    component: Password,
                    meta: {
                        auth: true,
                        label: 'routes.password',
                    },
                },
                {
                    path: '/users',
                    name: 'Users',
                    component: Users,
                    meta: {
                        auth: true,
                        admin: true,
                        label: 'routes.users',
                    },
                },
                {
                    path: '/backups',
                    name: 'Backups',
                    component: Backups,
                    meta: {
                        auth: true,
                        admin: true,
                        label: 'routes.backups',
                    },
                },
            ],
        },
        {
            path: '/404',
            name: 'Not Found',
            component: NotFound,
            meta: {
                label: 'routes.404',
            }
        },
        {
            path: '/login',
            name: 'Login',
            component: Login,
            meta: {
                label: 'routes.login',
            }
        },
        {
            path: '*',
            redirect: '/',
            meta: {
                label: 'routes.home',
            }
        },
    ]
}

Router.beforeEach(async (to, from, next) => {

    if (to.matched.some(record => record.meta.auth || record.meta.admin)) {
        const logged = await authHelper.isLogged();
        if (!logged) {
            next({
                path: '/login',
            });
        } else {
            if (to.matched.some(record => record.meta.admin)) {
                if (authHelper.isAdmin()) {
                    next();
                } else {
                    next({
                        path: '/',
                    });
                    toastAlert('You do not have permission to view this page.', 'error');
                }
            } else {
                next();
            }
        }
    } else {
        next();
    }

});

export default Router;

