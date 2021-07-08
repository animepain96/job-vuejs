<template>
  <CDropdown
      inNav
      class="c-header-nav-items"
      placement="bottom-end"
      add-menu-classes="pt-0"
  >
    <template #toggler>
      <CHeaderNavLink>
        <div class="font-weight-bold">
          {{ userName }}
        </div>
      </CHeaderNavLink>
    </template>
    <CDropdownHeader
        tag="div"
        class="text-center"
        color="light"
    >
      <strong>{{ this.$tc('header.settings') }}</strong>
    </CDropdownHeader>
    <CDropdownItem to="/password">
      <CIcon name="cil-shield-alt"/>
      {{ this.$tc('header.password') }}
    </CDropdownItem>
    <CDropdownItem @click="logout">
      <CIcon name="cil-lock-locked"/>
      {{ this.$tc('header.logout') }}
    </CDropdownItem>
  </CDropdown>
</template>

<script>
export default {
  name: 'TheHeaderDropdownAccnt',
  data() {
    return {}
  },
  computed: {
    userName() {
      return this.$store.state.auth.user ? this.$store.state.auth.user.name : 'Guest';
    },
  },
  methods: {
    logout() {
      this.$store.dispatch('auth/logout');
      this.$router.push('/login')
    },
  },
}
</script>

<style scoped>
.c-icon {
  margin-right: 0.3rem;
}
</style>