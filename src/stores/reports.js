import HTTP from "@/helpers/http";
import {GET_REPORT} from "@/constants/reportAPI";
import {toastAlert} from "@/helpers/alert";
import {DELETE_JOB, UPDATE_JOB} from "@/constants/jobAPI";
import moment from "moment";

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

            if(query) {
                params = Object.assign({}, query);
                if(params.from) {
                    params.from = moment(params.from).format('YYYY-MM-DD');
                }
                if(params.to) {
                    params.to = moment(params.to).format('YYYY-MM-DD');
                }
            }
            let config = {
                headers: {
                    accept: 'application/json',
                }
            };

            if(params) {
                config.params = params;
            }
             return HTTP(true).get(GET_REPORT, config).then(response => {
                commit('updateList', response.data.data);
                return true;
            }).catch(() => {
                return false;
            });
        },
        updateJob({commit, state}, payload) {
            return HTTP(true).patch(UPDATE_JOB(payload.id), payload.data, {
                headers: {
                    Accept: 'application/json',
                }
            }).then(response => {
                if (response.data.status === 'success') {
                    let jobs = state.jobs.map(job => {
                        if (job.id === response.data.data.id) {
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

                toastAlert('There was an error. Please try again.', 'error');
                return false;
            }).catch(() => {
                return false;
            });
        },
        delete({commit, state}, job) {
            return HTTP(true).delete(DELETE_JOB(job.id), {
                headers: {
                    Accept: 'application/json',
                }
            }).then(response => {
                if (response.data.status && response.data.status === 'success') {
                    let jobs = state.jobs.filter((item) => {
                        if (job.id !== item.id) {
                            return item;
                        }
                    });

                    commit('updateList', jobs);
                    toastAlert('The job was deleted successfully.', 'success');

                    return true;
                }

                toastAlert('There was an error. Please try again.', 'error')
                return false;
            }).catch(() => {
                return false;
            });
        },
    },
};

export default reports;