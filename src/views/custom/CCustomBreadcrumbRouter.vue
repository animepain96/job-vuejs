<template>
  <CBreadcrumb v-bind="props">
    <slot></slot>
  </CBreadcrumb>
</template>

<script>
import CBreadcrumb from '@coreui/vue/src/components/breadcrumb/CBreadcrumb'

export default {
  name: 'CCustomBreadcrumbRouter',
  components: {
    CBreadcrumb
  },
  props: {
    addClasses: [String, Array, Object],
    addLinkClasses: [String, Array, Object],
    addLastItemClasses: [String, Array, Object]
  },
  computed: {
    items () {
      const i18n = this.$i18n;
      const routes = this.$route.matched.filter(route => {
        return route.name || (route.meta && route.meta.label)
      })
      return routes.map(route => {
        const meta = route.meta || {}
        return {
          to: route,
          text: i18n.tc(meta.label) || route.name
        }
      })
    },
    props () {
      return {
        items: this.items,
        addClasses: this.addClasses,
        addLinkClasses: this.addLinkClasses,
        addLastItemClasses: this.addLastItemClasses
      }
    }
  }
}
</script>
