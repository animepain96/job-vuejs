<template>
  <div>
    <CSelect :value.sync="$root.$i18n.locale" :options="langs" @update:value="updateLangState"/>
  </div>
</template>

<script>
export default {
  name: "LanguageChanger",
  data() {
    return {
      langs: [
        {value: 'vi', label: 'Vietnamese'},
        {value: 'en', label: 'English'},
      ],
    };
  },
  methods: {
    updateLangState(lang) {
      this.$store.commit('app/setLang', lang);
    }
  }
}
</script>

<style scoped>

</style>