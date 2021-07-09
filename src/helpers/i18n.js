import Vue from "vue";
import VueI18n from "vue-i18n";
import vi from "@/assets/lang/vi.json";
import en from "@/assets/lang/en.json";

Vue.use(VueI18n)

const messages = {
    vi: vi,
    en: en
};

export default new VueI18n({
    locale: localStorage.lang,
    messages,
    fallbackLocale: 'en'
});
