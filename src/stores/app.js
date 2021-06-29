import HTTP from "@/helpers/http";
import {UNPAID_COUNT, UNPAID_THRESHOLD, UPDATE_UNPAID_THRESHOLD} from "@/constants/settingAPI";
import {toastAlert} from "@/helpers/alert";

const app = {
    namespaced: true,
    state: {
        isLoading: false,
        unpaidThreshold: 0,
        unpaidCount: 0,
    },
    mutations: {
        setLoading(state, status) {
            state.isLoading = status;
        },
        setUnpaidThreshold(state, unpaid) {
            state.unpaidThreshold = unpaid;
        },
        setUnpaidCount(state, count) {
            state.unpaidCount = count;
        },
    },
    actions: {
        getUnpaidThreshold({commit}) {
            return HTTP(true).get(UNPAID_THRESHOLD)
                .then(response => {
                    if (response.data.status === 'success') {
                        commit('setUnpaidThreshold', response.data.data);
                        return true;
                    }

                    toastAlert('Fetching unpaid threshold error.', 'error');
                    return false;
                }).catch(() => {
                    toastAlert('Fetching unpaid threshold error.', 'error');
                    return false;
                });
        },
        getUnpaidCount({commit}) {
            return HTTP(true).get(UNPAID_COUNT)
                .then(response => {
                    if (response.data.status === 'success') {
                        commit('setUnpaidCount', response.data.data);
                        return true;
                    }

                    toastAlert('Fetching unpaid count error.', 'error');
                    return false;
                }).catch(() => {
                    toastAlert('Fetching unpaid count error.', 'error');
                    return false;
                });
        },
        updateUnpaidThreshold({commit, dispatch}, payload) {
            return HTTP(true).patch(UPDATE_UNPAID_THRESHOLD, payload)
                .then(response => {
                    if (response.data.status === 'success') {
                        commit('setUnpaidThreshold', response.data.data);
                        dispatch('getUnpaidCount');
                        return true;
                    }

                    toastAlert('There was an error. Please try again.', 'error');
                    return false;
                }).catch(() => {
                    toastAlert('There was an error. Please try again.', 'error');
                    return false;
                });
        },
    },
};

export default app;