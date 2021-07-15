import HTTP, {handleError} from "@/helpers/http";
import {GET_REPORT} from "@/constants/reportAPI";
import {toastAlert} from "@/helpers/alert";
import {DELETE_JOB, UPDATE_JOB} from "@/constants/jobAPI";
import {format} from "date-fns";
import i18n from "@/helpers/i18n";

const now = new Date();

const reports = {
    namespaced: true,
    state: {
        query: {
            from: new Date(now.getFullYear(), now.getMonth(), 1),
            to: new Date(now.getFullYear(), now.getMonth() + 1, 0),
            mode: 0,
            customer: 0,
            type: 0,
            method: 0,
            paid: 0,
        },
        jobs: [],
    },
    mutations: {
        updateQuery(state, query) {
            state.query = query;
        },
        updateList(state, jobs) {
            state.jobs = jobs;
        },
    },
    actions: {
        getList({commit}, query) {
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
            return HTTP(true).get(GET_REPORT, config).then(response => {
                commit('updateList', response.data.data);
                return true;
            }).catch(error => handleError(error));
        },
        updateJob({commit, state}, payload) {
            return HTTP(true).patch(UPDATE_JOB(payload.ID), payload.data)
                .then(response => {
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
        delete({commit, state}, job) {
            return HTTP(true).delete(DELETE_JOB(job.ID))
                .then(response => {
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
    },
};

export default reports;
