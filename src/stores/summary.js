import HTTP, {handleError} from "@/helpers/http";
import {CHART_REPORT} from "@/constants/summaryAPI";
import {format} from "date-fns";

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
        getAnnualRevenue({commit}, query) {

            return HTTP(true).get(CHART_REPORT, {
                params: query,
            })
                .then(response => {
                    commit('updateAnnualRevenue', response.data.data);
                    return true;
                }).catch(error => handleError(error));
        },
    },
};

export default summary;
