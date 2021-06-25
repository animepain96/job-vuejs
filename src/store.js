import Vue from 'vue'
import Vuex from 'vuex'
import app from "@/stores/app";
import customers from "@/stores/customers";
import sidebar from "@/stores/sidebar";
import methods from "@/stores/methods";
import types from "@/stores/types";
import jobs from "@/stores/jobs";
import summary from "@/stores/summary";
import reports from "@/stores/reports";
import auth from "@/stores/auth";
Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    sidebar: sidebar,
    customers: customers,
    methods: methods,
    types: types,
    app: app,
    jobs: jobs,
    summary: summary,
    reports: reports,
    auth: auth,
  }
})