import HTTP, {handleError} from "@/helpers/http";
import {DELETE_METHOD, METHOD_LIST, UPDATE_METHOD, CREATE_METHOD} from "@/constants/methodAPI";
import {toastAlert} from "@/helpers/alert";
import i18n from "@/helpers/i18n";

const methods = {
    namespaced: true,
    state: {
        loading: false,
        query: {per_page: 10, order: null, sort_by: null, q: null, unpaid: null, page: 1},
        total_page: null,
        methods: [],
    },
    mutations: {
        updateList(state, payload) {
            state.methods = payload.data;
            state.total_page = payload.last_page ?? null;
            if (state.query.page != payload.current_page) {
                state.query.page = payload.current_page;
            }
        },
        updateQuery(state, query) {
            for (const [key, value] of Object.entries(query)) {
                if (key in state.query) {
                    state.query[key] = value;
                }
            }
        },
        updateLoading(state, {loading}) {
            state.loading = loading;
        },
    },
    actions: {
        getList({commit}, query) {
            commit('updateLoading', {loading: true});
            return HTTP(true)
                .get(METHOD_LIST, {
                    headers: {
                        Accept: 'application/json',
                    },
                    params: query
                })
                .then(response => {
                    commit('updateList', response.data.data);
                    return true;
                })
                .catch(error => handleError(error))
                .finally(() => commit('updateLoading', {loading: false}));
        },
        update({commit}, payload) {
            commit('updateLoading', {loading: true});
            return HTTP(true)
                .patch(UPDATE_METHOD(payload.ID), {
                    Name: payload.Name,
                }, {
                    headers: {
                        Accept: 'application/json',
                    }
                })
                .then(response => {
                    if (response.data.status && response.data.status === 'success') {
                        return true;
                    }

                    toastAlert(i18n.tc('alerts.app.server_error'), 'error')
                    return false;
                })
                .catch(error => handleError(error))
                .finally(() => commit('updateLoading', {loading: false}));
        },
        delete({commit}, method) {
            commit('updateLoading', {loading: true});
            return HTTP(true)
                .delete(DELETE_METHOD(method.ID), {
                    headers: {
                        Accept: 'application/json',
                    }
                })
                .then(response => {
                    if (response.data.status && response.data.status === 'success') {
                        toastAlert(i18n.tc('alerts.methods.success_delete'), 'success');

                        return true;
                    }

                    toastAlert(i18n.tc('alerts.app.server_error'), 'error')
                    return false;
                })
                .catch(error => handleError(error))
                .finally(() => commit('updateLoading', {loading: false}));
        },
        create({commit}, method) {
            commit('updateLoading', {loading: true});
            return HTTP(true)
                .post(CREATE_METHOD, {
                    Name: method.Name,
                }, {
                    headers: {
                        Accept: 'application/json',
                    }
                })
                .then(response => {
                    if (response.data.status && response.data.status === 'success') {
                        toastAlert(i18n.tc('alerts.methods.success_create'), 'success');
                        return true;
                    }
                    toastAlert(i18n.tc('alerts.app.server_error'), 'error')
                    return false;
                })
                .catch(error => handleError(error))
                .finally(() => commit('updateLoading', {loading: false}));
        },
    },
};

export default methods;
