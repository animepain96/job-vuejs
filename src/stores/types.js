import HTTP, {handleError} from "@/helpers/http";
import {TYPE_LIST, UPDATE_TYPE, DELETE_TYPE, CREATE_TYPE} from "@/constants/typeAPI";
import {toastAlert} from "@/helpers/alert";
import i18n from "@/helpers/i18n";

const types = {
    namespaced: true,
    state: {
        loading: false,
        query: {per_page: 10, order: null, sort_by: null, q: null, unpaid: null, page: 1},
        total_page: null,
        types: [],
    },
    mutations: {
        updateList(state, payload) {
            state.types = payload.data;
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
                .get(TYPE_LIST, {
                    headers: {
                        Accept: 'application/json',
                    },
                    params: query
                })
                .then(response => {
                    if (response.data.status === 'success') {
                        commit('updateList', response.data.data);
                        return true;
                    }

                    return false;
                })
                .catch(error => handleError(error))
                .finally(() => commit('updateLoading', {loading: false}));
        },
        update({commit}, payload) {
            commit('updateLoading', {loading: true});
            return HTTP(true)
                .patch(UPDATE_TYPE(payload.ID), {
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

                    toastAlert(i18n.tc('alerts.app.server_error'), 'error');
                    return false;
                })
                .catch(error => handleError(error))
                .finally(() => commit('updateLoading', {loading: false}));
        },
        delete({commit}, type) {
            commit('updateLoading', {loading: true});
            return HTTP(true)
                .delete(DELETE_TYPE(type.ID), {
                    headers: {
                        Accept: 'application/json',
                    }
                })
                .then(response => {
                    if (response.data.status && response.data.status === 'success') {
                        toastAlert(i18n.tc('alerts.types.success_delete'), 'success');
                        return true;
                    }

                    toastAlert(i18n.tc('alerts.app.server_error'), 'error');
                    return false;
                })
                .catch(error => handleError(error))
                .finally(() => commit('updateLoading', {loading: false}));
        },
        create({commit}, type) {
            commit('updateLoading', {loading: true});
            return HTTP(true)
                .post(CREATE_TYPE, {
                    Name: type.Name,
                }, {
                    headers: {
                        Accept: 'application/json',
                    }
                })
                .then(response => {
                    if (response.data.status && response.data.status === 'success') {
                        toastAlert(i18n.tc('alerts.types.success_create'), 'success');
                        return true;
                    }
                    toastAlert(i18n.tc('alerts.app.server_error'), 'error');
                    return false;
                })
                .catch(error => handleError(error))
                .finally(() => commit('updateLoading', {loading: false}));
        },
    },
};

export default types;
