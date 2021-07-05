import HTTP from "@/helpers/http";
import {CHART_REPORT} from "@/constants/summaryAPI";
import {toastAlert} from "@/helpers/alert";

const summary = {
    namespaced: true,
    state: {
        annualRevenue: [],
    },
    mutations: {
        updateAnnualRevenue(state, annualRevenue) {
            state.annualRevenue = annualRevenue;
        },
    },
    actions: {
        getAnnualRevenue({commit}) {
            return HTTP(true).get(CHART_REPORT, {
                headers: {
                    accept: 'application/json',
                },
            })
                .then(response => {
                    commit('updateAnnualRevenue', response.data.data);
                    return true;
                }).catch(() => {
                    return false;
                });
        },
    },
};

export default summary;