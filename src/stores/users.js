import HTTP, {handleError} from "@/helpers/http";
import {CREATE_USER, DELETE_USER, GET_USERS, RESET_PASSWORD, UPDATE_USER} from "@/constants/userAPI";
import {toastAlert} from "@/helpers/alert";
import i18n from "@/helpers/i18n";

const users = {
    namespaced: true,
    state: {
        loading: false,
        query: {per_page: 10, order: null, sort_by: null, q: null, unpaid: null, page: 1},
        total_page: null,
        users: [],
    },
    mutations: {
        setUsers(state, payload) {
            state.users = payload.data;
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
                .get(GET_USERS, {
                    headers: {
                        Accept: 'application/json',
                    },
                    params: query
                })
                .then(response => {
                    if (response.data.status === 'success') {
                        commit('setUsers', response.data.data);
                        return true;
                    }

                    toastAlert(i18n.tc('alerts.auth.invalid'), 'error');
                    return false;
                })
                .catch(error => handleError(error))
                .finally(() => commit('updateLoading', {loading: false}));
        },
        createUser({commit}, payload) {
            commit('updateLoading', {loading: true});
            return HTTP(true)
                .post(CREATE_USER, payload)
                .then(response => {
                    if (response.data.status === 'success') {
                        toastAlert(i18n.tc('alerts.users.success_create'), 'success');
                        return true;
                    }

                    toastAlert(i18n.tc('alerts.app.server_error'), 'error');
                    return false;
                })
                .catch(error => handleError(error))
                .finally(() => commit('updateLoading', {loading: false}));
        },
        deleteUser({commit}, user) {
            commit('updateLoading', {loading: true});
            return HTTP(true)
                .delete(DELETE_USER(user.id))
                .then(response => {
                    if (response.data.status === 'success') {
                        toastAlert(i18n.tc('alerts.users.success_delete'), 'success');
                        return true;
                    }

                    toastAlert(i18n.tc('alerts.app.server_error'), 'error');
                    return false;
                })
                .catch(error => handleError(error))
                .finally(() => commit('updateLoading', {loading: false}));
        },
        resetPassword({commit}, user) {
            commit('updateLoading', {loading: true});
            return HTTP(true)
                .post(RESET_PASSWORD(user.id))
                .then(response => {
                    if (response.data.status === 'success') {
                        toastAlert(i18n.tc('alerts.users.success_password'), 'success');
                        return true;
                    }

                    toastAlert(i18n.tc('alerts.app.server_error'), 'error');
                    return false;
                })
                .catch(error => handleError(error))
                .finally(() => commit('updateLoading', {loading: false}));
        },
        updateUser({commit}, payload) {
            commit('updateLoading', {loading: true});
            return HTTP(true)
                .patch(UPDATE_USER(payload.id), {field: payload.data.field, value: payload.data.value})
                .then(response => {
                    if (response.data.status === 'success') {
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

export default users;
