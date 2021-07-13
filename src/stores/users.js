import HTTP, {handleError} from "@/helpers/http";
import {CREATE_USER, DELETE_USER, GET_USERS, RESET_PASSWORD, UPDATE_USER} from "@/constants/userAPI";
import {toastAlert} from "@/helpers/alert";
import i18n from "@/helpers/i18n";

const users = {
    namespaced: true,
    state: {
        users: [],
    },
    mutations: {
        setUsers(state, users) {
            state.users = users;
        },
    },
    actions: {
        getUsers({commit}) {
            return HTTP(true).get(GET_USERS)
                .then(response => {
                    if (response.data.status === 'success') {
                        commit('setUsers', response.data.data);
                        return true;
                    }

                    toastAlert(i18n.tc('alerts.auth.invalid'), 'error');
                    return false;
                }).catch(error => handleError(error));
        },
        createUser({commit, state}, payload) {
            return HTTP(true).post(CREATE_USER, payload)
                .then(response => {
                    if(response.data.status === 'success') {
                        let users = state.users;
                        users.push(response.data.data);
                        commit('setUsers', users);

                        toastAlert(i18n.tc('alerts.users.success_create'), 'success');
                        return true;
                    }

                    toastAlert(i18n.tc('alerts.app.server_error'), 'error');
                    return false;
                }).catch(error => {
                    handleError(error);
                    if(error && error.response) {
                        if(error.response.status === 422) {

                        }
                    }
                });
        },
        deleteUser({commit, state}, user) {
            return HTTP(true).delete(DELETE_USER(user.id))
                .then(response => {
                    if(response.data.status === 'success') {
                        let users = state.users;
                        users.splice(users.findIndex((item) => item.id === response.data.data.id), 1);
                        commit('setUsers', users);

                        toastAlert(i18n.tc('alerts.users.success_delete'), 'success');
                        return true;
                    }

                    toastAlert(i18n.tc('alerts.app.server_error'), 'error');
                    return false;
                }).catch(error => handleError(error));
        },
        resetPassword({commit}, user) {
            return HTTP(true).post(RESET_PASSWORD(user.id))
                .then(response => {
                    if(response.data.status === 'success') {
                        toastAlert(i18n.tc('alerts.users.success_password'), 'success');
                        return true;
                    }

                    toastAlert(i18n.tc('alerts.app.server_error'), 'error');
                    return false;
                }).catch(error => handleError(error));
        },
        updateUser({commit, state}, payload) {
            return HTTP(true).patch(UPDATE_USER(payload.id), {field: payload.data.field, value: payload.data.value})
                .then(response => {
                    if(response.data.status === 'success') {
                        let users = state.users.map((user) => {
                            if(user.id === response.data.data.id) {
                                return response.data.data;
                            }

                            return user;
                        });
                        commit('setUsers', users);

                        return true;
                    }

                    toastAlert(i18n.tc('alerts.app.server_error'), 'error');
                    return false;
                }).catch(error => handleError(error));
        },
    },
};

export default users;
