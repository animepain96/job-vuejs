import {ADDITION_LIST, CREATE_JOB, DELETE_JOB, GET_RATE, JOB_LIST, UPDATE_JOB} from "@/constants/jobAPI";
import {toastAlert} from "@/helpers/alert";
import HTTP, {handleError} from "@/helpers/http";
import i18n from "@/helpers/i18n";

const jobs = {
    namespaced: true,
    state: {
        jobs: [],
        customers: [],
        types: [],
        methods: [],
        rate: 0,
    },
    mutations: {
        updateList(state, jobs) {
            state.jobs = jobs;
        },
        updateAdditionList(state, data) {
            state.customers = data.customers;
            state.types = data.types;
            state.methods = data.methods;
        },
        updateRate(state, rate) {
            state.rate = rate;
        }
    },
    actions: {
        getList({commit}) {
            return HTTP(true).get(JOB_LIST, {
                headers: {
                    Accept: 'application/json',
                },
            }).then(response => {
                if (response.data.status === 'success') {
                    commit('updateList', response.data.data);
                    return true;
                }

                toastAlert(i18n.tc('alerts.app.server_error'), 'error');
                return false;
            }).catch(error => handleError(error));
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
                            if(job._toggled) {
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
                if(response.data.status === 'success'){
                    commit('updateRate', response.data.data);

                    return true;
                }

                toastAlert(i18n.tc('alerts.app.server_error'), 'error');
                return false;
            }).catch(error => handleError(error));
        },
        delete({commit, state}, job) {
            return HTTP(true).delete(DELETE_JOB(job.ID), {
                headers: {
                    Accept: 'application/json',
                }
            }).then(response => {
                if (response.data.status && response.data.status === 'success') {
                    let jobs = state.jobs.filter((item) => {
                        if (job.ID !== item.ID) {
                            return item;
                        }
                    });

                    commit('updateList', jobs);
                    toastAlert(i18n.tc('alerts.jobs.success_delete'), 'success');

                    return true;
                }

                toastAlert(i18n.tc('alerts.app.server_error'), 'error');
                return false;
            }).catch(error => handleError(error));
        },
        create({commit, state}, payload) {
            return HTTP(true).post(CREATE_JOB, payload, {
                headers: {
                    Accept: 'application/json',
                }
            }).then(response => {
                if (response.data.status && response.data.status === 'success') {
                    let jobs = state.jobs;
                    jobs.push(response.data.data);

                    commit('updateList', jobs);
                    toastAlert(i18n.tc('alerts.jobs.success_create'), 'success');

                    return true;
                }

                toastAlert(i18n.tc('alerts.app.server_error'), 'error');
                return false;
            }).catch(error => handleError(error));
        }
    },
};

export default jobs;
