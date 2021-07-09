<template>
  <CDropdown :togglerText="this.$tc('header.lang.title')">
    <CDropdownItem @click="updateLangState('vi')">
      <div>
        <CIcon name="cif-vn"/>
        {{this.$tc('header.lang.vi')}}
      </div>
    </CDropdownItem>
    <CDropdownItem @click="updateLangState('en')">
      <div>
        <CIcon name="cif-gb"/>
        {{ this.$tc('header.lang.en') }}
      </div>
    </CDropdownItem>
  </CDropdown>
</template>

<script>
export default {
  name: "LanguageChanger",
  methods: {
    updateLangState(lang) {
      this.$i18n.locale = lang;
      localStorage.lang = lang;
    }
  },
}
</script>

<style scoped>

</style>
