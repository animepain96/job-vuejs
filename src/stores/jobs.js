import {ADDITION_LIST, CREATE_JOB, DELETE_JOB, GET_RATE, JOB_LIST, UPDATE_JOB} from "@/constants/jobAPI";
import {toastAlert} from "@/helpers/alert";
import HTTP from "@/helpers/http";

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

                toastAlert('There was an error. Please try again.', 'error');
                return false;
            }).catch(() => {
                return false;
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

                toastAlert('There was an error. Please try again.', 'error');
                return false;
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

                toastAlert('There was an error when get Exchange Rate. Please try again.', 'error');
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
                    toastAlert('The job was created successfully.', 'success');

                    return true;
                }

                toastAlert('There was an error. Please try again.', 'error')
                return false;
            }).catch(() => {
                return false;
            });
        }
    },
};

export default jobs;