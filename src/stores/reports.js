import HTTP, {handleError} from "@/helpers/http";
import {GET_REPORT} from "@/constants/reportAPI";
import {toastAlert} from "@/helpers/alert";
import {DELETE_JOB, UPDATE_JOB} from "@/constants/jobAPI";
import {format} from "date-fns";
import i18n from "@/helpers/i18n";
import {GET_REVENUE} from "../constants/reportAPI";

const reports = {
    namespaced: true,
    state: {
        loading: false,
        total_page: null,
        query: {
            paid: 0,
            per_page: 10,
            order: null,
            q: null,
            page: 1,
            from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            to: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
            mode: null,
            customer: null,
            type: null,
            method: null,
        },
        revenue: {price: 0, price_yen: 0},
        jobs: [],
    },
    mutations: {
        updateQuery(state, query) {
            for (const [key, value] of Object.entries(query)) {
                if (key in state.query) {
                    state.query[key] = value;
                }
            }
        },
        updateList(state, payload) {
            state.jobs = payload.data;
            state.total_page = payload.last_page ?? null;
            if (state.query.page != payload.current_page) {
                state.query.page = payload.current_page;
            }
        },
        updateLoading(state, {loading}) {
            state.loading = loading;
        },
        updateRevenue(state, revenue) {
            state.revenue = revenue;
        },
    },
    actions: {
        getList({commit, dispatch}, query) {
            let params = null;

            if (query) {
                params = Object.assign({}, query);
                if (params.from) {
                    params.from = format(query.from, 'yyyy-MM-dd');
                }
                if (params.to) {
                    params.to = format(query.to, 'yyyy-MM-dd');
                }
            }
            let config = {};

            if (params) {
                config.params = params;
            }

            commit('updateLoading', {loading: true});
            return HTTP(true)
                .get(GET_REPORT, config)
                .then(response => {
                    if (response.data.status === 'success') {
                        commit('updateList', response.data.data);
                        dispatch('getRevenue', config);
                        return true;
                    }

                    toastAlert(i18n.tc('alerts.app.server_error'), 'error');
                    return false;
                })
                .catch(error => handleError(error))
                .finally(() => {
                    commit('updateLoading', {loading: false});
                });
        },
        updateJob({commit}, payload) {
            commit('updateLoading', {loading: true});
            return HTTP(true)
                .patch(UPDATE_JOB(payload.ID), payload.data)
                .then(response => {
                    if (response.data.status === 'success') {
                        return true;
                    }

                    toastAlert(i18n.tc('alerts.app.server_error'), 'error');
                    return false;
                })
                .catch(error => handleError(error))
                .finally(() => commit('updateLoading', {loading: false}));
        },
        delete({commit}, job) {
            commit('updateLoading', {loading: true});
            return HTTP(true)
                .delete(DELETE_JOB(job.ID))
                .then(response => {
                    if (response.data.status && response.data.status === 'success') {
                        toastAlert(i18n.tc('alerts.jobs.success_delete'), 'success');

                        return true;
                    }

                    toastAlert(i18n.tc('alerts.app.server_error'), 'error');
                    return false;
                }).catch(error => handleError(error))
                .finally(() => commit('updateLoading', {loading: false}));
        },
        getRevenue({commit}, config) {
            commit('updateLoading', {loading: true});
            return HTTP(true)
                .get(GET_REVENUE, config)
                .then(response => {
                    if (response.data.status === 'success') {
                        commit('updateRevenue', response.data.data);
                        return true;
                    }

                    toastAlert(i18n.tc('alerts.app.server_error'), 'error');
                    return false;
                })
                .catch(error => handleError(error))
                .finally(() => {
                    commit('updateLoading', {loading: false});
                });
        }
    },
};

export default reports;
