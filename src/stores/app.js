import HTTP, {handleError} from "@/helpers/http";
import {
    KEEP_DAYS,
    UNPAID_COUNT,
    UNPAID_THRESHOLD,
    UPDATE_KEEP_DAYS,
    UPDATE_UNPAID_THRESHOLD
} from "@/constants/settingAPI";

const app = {
    namespaced: true,
    state: {
        isLoading: false,
        unpaidThreshold: 0,
        unpaidCount: 0,
        tableLoading: false,
        keepDays: 0,
        lang: 'en',
    },
    mutations: {
        setTableLoading(state, status) {
          state.tableLoading = status;
        },
        setLoading(state, status) {
            state.isLoading = status;
        },
        setUnpaidThreshold(state, unpaid) {
            state.unpaidThreshold = unpaid;
        },
        setUnpaidCount(state, count) {
            state.unpaidCount = count;
        },
        setKeepDays(state, keepDays) {
            state.keepDays = keepDays;
        },
        setLang(state, lang) {
            state.lang = lang;
        }
    },
    actions: {
        getUnpaidThreshold({commit}) {
            return HTTP(true).get(UNPAID_THRESHOLD)
                .then(response => {
                    if (response.data.status === 'success') {
                        commit('setUnpaidThreshold', response.data.data);
                        return true;
                    }

                    return false;
                }).catch(error => handleError(error));
        },
        getUnpaidCount({commit}) {
            return HTTP(true).get(UNPAID_COUNT)
                .then(response => {
                    if (response.data.status === 'success') {
                        commit('setUnpaidCount', response.data.data);
                        return true;
                    }

                    return false;
                }).catch(error => handleError(error));
        },
        updateUnpaidThreshold({commit, dispatch}, payload) {
            return HTTP(true).patch(UPDATE_UNPAID_THRESHOLD, payload)
                .then(response => {
                    if (response.data.status === 'success') {
                        commit('setUnpaidThreshold', response.data.data);
                        dispatch('getUnpaidCount');
                        return true;
                    }

                    return false;
                }).catch(error => handleError(error));
        },
        getKeepDays({commit}) {
            return HTTP(true).get(KEEP_DAYS)
                .then(response => {
                    if (response.data.status === 'success') {
                        commit('setKeepDays', response.data.data);
                        return true;
                    }

                    return false;
                }).catch(error => handleError(error));
        },
        updateKeepDays({commit}, payload) {
            return HTTP(true).patch(UPDATE_KEEP_DAYS, payload)
                .then(response => {
                    if (response.data.status === 'success') {
                        commit('setKeepDays', response.data.data);
                        return true;
                    }

                    return false;
                }).catch(error => handleError(error));
        },
    },
};

export default app;