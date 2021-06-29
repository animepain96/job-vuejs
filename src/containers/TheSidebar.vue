<template>
  <CSidebar 
    fixed 
    :minimize="minimize"
    :show="show"
    @update:show="(value) => $store.commit('set', ['sidebarShow', value])"
  >
    <CSidebarBrand class="d-md-down-none" to="/">
      <CIcon 
        class="c-sidebar-brand-full" 
        name="logo" 
        size="custom-size" 
        :height="35" 
        viewBox="0 0 556 134"
      />
      <CIcon 
        class="c-sidebar-brand-minimized" 
        name="logo" 
        size="custom-size" 
        :height="35" 
        viewBox="0 0 110 134"
      />
    </CSidebarBrand>

    <CRenderFunction flat :content-to-render="navItems"/>
    <CSidebarMinimizer
      class="d-md-down-none"
      @click.native="$store.commit('set', ['sidebarMinimize', !minimize])"
    />
  </CSidebar>
</template>

<script>
import nav from './_nav'

export default {
  name: 'TheSidebar',
  nav,
  computed: {
    navItems() {
      let result = this.$options.nav;
      let unpaidCount = this.$store.state.app.unpaidCount;
      result = result.map((item) => {
        item._children = item._children.map((child) => {
          if(child.name === 'Customers') {
            child.badge = {
              text: unpaidCount,
              color: 'danger',
            };
          }
          return child;
        });

        return item;
      });
      return result;
    },
    show () {
      return this.$store.state.sidebar.sidebarShow
    },
    minimize () {
      return this.$store.state.sidebar.sidebarMinimize
    }
  }
}
</script>
