import i18n from "@/helpers/i18n";

export default [
    {
        _name: 'CSidebarNavItem',
        name: i18n.t('routes.jobs'),
        to: '/jobs',
        icon: 'cib-product-hunt',
        meta: {
            admin: false,
        },
    },
    {
        _name: 'CSidebarNavItem',
        name: i18n.t('routes.customers'),
        to: '/customers',
        icon: 'cil-people',
        meta: {
            admin: false,
        },
    },
    {
        _name: 'CSidebarNavItem',
        name: i18n.t('routes.methods'),
        to: '/methods',
        icon: 'cil-cog',
        meta: {
            admin: false,
        },
    },
    {
        _name: 'CSidebarNavItem',
        name: i18n.t('routes.types'),
        to: '/types',
        icon: 'cil-folder',
        meta: {
            admin: false,
        },
    },
    {
        _name: 'CSidebarNavItem',
        name: i18n.t('routes.report'),
        to: '/report',
        icon: 'cib-buffer',
        meta: {
            admin: false,
        },
    },
    {
        _name: 'CSidebarNavItem',
        name: i18n.t('routes.chart_report'),
        to: '/chart-report',
        icon: 'cil-chart-pie',
        meta: {
            admin: false,
        },
    },
    {
        _name: 'CSidebarNavItem',
        name: i18n.t('routes.users'),
        to: '/users',
        icon: 'cil-user',
        meta: {
            admin: true,
        },
    },
    {
        _name: 'CSidebarNavItem',
        name: i18n.t('routes.backups'),
        to: '/backups',
        icon: 'cil-storage',
        meta: {
            admin: true,
        },
    },
];