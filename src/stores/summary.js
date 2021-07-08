import HTTP, {handleError} from "@/helpers/http";
import {CHART_REPORT} from "@/constants/summaryAPI";

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
                }).catch(error => handleError(error));
        },
    },
};

export default summary;