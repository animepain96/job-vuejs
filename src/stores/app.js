import HTTP from "@/helpers/http";
import {UNPAID_COUNT, UNPAID_THRESHOLD, UPDATE_UNPAID_THRESHOLD} from "@/constants/settingAPI";
import {toastAlert} from "@/helpers/alert";
import ca from "vue2-datepicker/locale/es/ca";

const app = {
    namespaced: true,
    state: {
        isLoading: false,
        unpaidThreshold: 0,
        unpaidCount: 0,
        tableLoading: false,
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
                }).catch((error) => {
                    console.log(error);
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

                    return false;
                }).catch(() => {
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

                    return false;
                }).catch(() => {
                    return false;
                });
        },
    },
};

export default app;