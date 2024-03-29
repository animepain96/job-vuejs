import {ADDITION_LIST, CREATE_JOB, DELETE_JOB, GET_RATE, JOB_LIST, UPDATE_JOB} from "@/constants/jobAPI";
import {toastAlert} from "@/helpers/alert";
import HTTP, {handleError} from "@/helpers/http";
import i18n from "@/helpers/i18n";
import {GET_MONTHLY_REVENUE} from "../constants/jobAPI";

const jobs = {
    namespaced: true,
    state: {
        loading: false,
        jobs: [],
        query: {per_page: 10, order: null, q: null, page: 1},
        total_page: null,
        customers: [],
        types: [],
        methods: [],
        rate: 0,
        monthly_revenue: {price: 0, price_yen: 0},
    },
    mutations: {
        updateList(state, payload) {
            state.jobs = payload.data;
            state.total_page = payload.last_page ?? null;
            if (state.query.page != payload.current_page) {
                state.query.page = payload.current_page;
            }
        },
        updateAdditionList(state, data) {
            state.customers = data.customers;
            state.types = data.types;
            state.methods = data.methods;
        },
        updateRate(state, rate) {
            state.rate = rate;
        },
        updateQuery(state, query) {
            for (const [key, value] of Object.entries(query)) {
                if (key in state.query) {
                    state.query[key] = value;
                }
            }
        },
        updateLoading(state, {loading}) {
            state.loading = loading;
        },
        updateMonthlyRevenue(state, monthly_revenue) {
            state.monthly_revenue = monthly_revenue;
        }
    },
    actions: {
        getList({commit}, params) {
            commit('updateLoading', {loading: true});
            return HTTP(true)
                .get(JOB_LIST, {
                    headers: {
                        Accept: 'application/json',
                    },
                    params: params,
                })
                .then(response => {
                    if (response.data.status === 'success') {
                        commit('updateList', response.data.data);
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
        getAdditionList({commit}) {
            return HTTP(true).get(ADDITION_LIST, {
                headers: {
                    Accept: 'application/json',
                },
            }).then(response => {
                if (response.data.status === 'success') {
                    commit('updateAdditionList',
                        {
                            customers: response.data.data.customers,
                            types: response.data.data.types,
                            methods: response.data.data.methods,
                        }
                    );
                    return true;
                }

                toastAlert(i18n.tc('alerts.app.server_error'), 'error');
                return false;
            }).catch(error => handleError(error));
        },
        getMonthlyRevenue({commit}) {
            return HTTP(true).get(GET_MONTHLY_REVENUE, {
                headers: {
                    Accept: 'application/json',
                },
            }).then(response => {
                if (response.data.status === 'success') {
                    commit('updateMonthlyRevenue',
                        {
                            price: response.data.data.price,
                            price_yen: response.data.data.price_yen,
                        }
                    );
                    return true;
                }

                toastAlert(i18n.tc('alerts.app.server_error'), 'error');
                return false;
            }).catch(error => handleError(error));
        },
        updateJob({commit, state}, payload) {
            return HTTP(true).patch(UPDATE_JOB(payload.ID), payload.data, {
                headers: {
                    Accept: 'application/json',
                }
            }).then(response => {
                if (response.data.status === 'success') {
                    let jobs = state.jobs.map(job => {
                        if (job.ID === response.data.data.ID) {
                            let responseJob = response.data.data;
                            if (job._toggled) {
                                responseJob._toggled = job._toggled;
                            }
                            return responseJob;
                        }
                        return job;
                    });

                    commit('updateList', jobs);

                    return true;
                }

                toastAlert(i18n.tc('alerts.app.server_error'), 'error');
                return false;
            }).catch(error => handleError(error));
        },
        getRate({commit}) {
            return HTTP(true).get(GET_RATE, {
                headers: {
                    Accept: 'application/json',
                },
            }).then(response => {
                if (response.data.status === 'success') {
                    commit('updateRate', response.data.data);

                    return true;
                }

                toastAlert(i18n.tc('alerts.app.server_error'), 'error');
                return false;
            }).catch(error => handleError(error));
        },
        delete({commit, state}, job) {
            commit('updateLoading', {loading: true});
            return HTTP(true)
                .delete(DELETE_JOB(job.ID), {
                    headers: {
                        Accept: 'application/json',
                    }
                })
                .then(response => {
                    if (response.data.status && response.data.status === 'success') {
                        toastAlert(i18n.tc('alerts.jobs.success_delete'), 'success');
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
        create({commit, state}, payload) {
            commit('updateLoading', {loading: true});
            return HTTP(true)
                .post(CREATE_JOB, payload, {
                    headers: {
                        Accept: 'application/json',
                    }
                })
                .then(response => {
                    if (response.data.status && response.data.status === 'success') {
                        toastAlert(i18n.tc('alerts.jobs.success_create'), 'success');

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

export default jobs;
