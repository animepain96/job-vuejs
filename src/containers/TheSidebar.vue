<template>
  <CSidebar
      fixed
      :minimize="minimize"
      :show="show"
      @update:show="(value) => $store.commit('set', ['sidebarShow', value])"
  >
    <CSidebarBrand class="d-md-down-none" to="/">
      <CImg style="object-fit: cover; object-position: center;" height="56px"
            :src="require('@/assets/images/bpotech.png')" alt="BPOTech JSC."/>
    </CSidebarBrand>

    <CRenderFunction flat :content-to-render="navData"/>
    <CSidebarMinimizer
        class="d-md-down-none"
        @click.native="$store.commit('set', ['sidebarMinimize', !minimize])"
    />
  </CSidebar>
</template>

<script>

export default {
  name: 'TheSidebar',
  computed: {
    tc() {
      return this.$tc;
    },
    navData() {
      return [
        {
          _name: 'CSidebarNav',
          _children: this.navItems,
        }
      ];
    },
    isAdmin() {
      return this.$store.state.auth.user && this.$store.state.auth.user.role === 'admin';
    },
    navItems() {
      let result = [
        {
          _name: 'CSidebarNavItem',
          name: this.$i18n.tc('routes.jobs'),
          to: '/jobs',
          icon: 'cib-product-hunt',
          meta: {
            admin: false,
          },
        },
        {
          _name: 'CSidebarNavItem',
          name: this.$i18n.tc('routes.customers'),
          to: '/customers',
          icon: 'cil-people',
          meta: {
            admin: false,
          },
        },
        {
          _name: 'CSidebarNavItem',
          name: this.$i18n.tc('routes.methods'),
          to: '/methods',
          icon: 'cil-cog',
          meta: {
            admin: false,
          },
        },
        {
          _name: 'CSidebarNavItem',
          name: this.$i18n.tc('routes.types'),
          to: '/types',
          icon: 'cil-folder',
          meta: {
            admin: false,
          },
        },
        {
          _name: 'CSidebarNavItem',
          name: this.$i18n.tc('routes.report'),
          to: '/report',
          icon: 'cib-buffer',
          meta: {
            admin: false,
          },
        },
        {
          _name: 'CSidebarNavItem',
          name: this.$i18n.tc('routes.chart_report'),
          to: '/chart-report',
          icon: 'cil-chart-pie',
          meta: {
            admin: false,
          },
        },
        {
          _name: 'CSidebarNavItem',
          name: this.$i18n.tc('routes.users'),
          to: '/users',
          icon: 'cil-user',
          meta: {
            admin: true,
          },
        },
        {
          _name: 'CSidebarNavItem',
          name: this.$i18n.tc('routes.backups'),
          to: '/backups',
          icon: 'cil-storage',
          meta: {
            admin: true,
          },
        },
      ];
      let admin = this.isAdmin;
      let unpaidCount = this.$store.state.app.unpaidCount;

      return result.map(function (item) {
        if (item.name === 'Customers') {
          item.badge = {
            text: unpaidCount,
            color: 'danger',
          };
        }

        return item;
      }).filter(function (child) {

        return !(child.meta.admin && !admin);
      });
    },
    show() {
      return this.$store.state.sidebar.sidebarShow
    },
    minimize() {
      return this.$store.state.sidebar.sidebarMinimize
    }
  }
}
</script>
