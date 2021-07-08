import HTTP, {handleError} from "@/helpers/http";
import {CREATE_USER, DELETE_USER, GET_USERS, RESET_PASSWORD, UPDATE_USER} from "@/constants/userAPI";
import {toastAlert} from "@/helpers/alert";

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

                    toastAlert('Your email or password is invalid. Please try again.', 'error');
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

                        toastAlert('The user was created successfully.', 'success');
                        return true;
                    }

                    toastAlert('Unable to create user. Please try again.', 'error');
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

                        toastAlert('The user was deleted successfully.', 'success');
                        return true;
                    }

                    toastAlert('Unable to delete user. Please try again.', 'error');
                    return false;
                }).catch(error => handleError(error));
        },
        resetPassword({commit}, user) {
            return HTTP(true).post(RESET_PASSWORD(user.id))
                .then(response => {
                    if(response.data.status === 'success') {
                        toastAlert('The user was reset password successfully.', 'success');
                        return true;
                    }

                    toastAlert('Unable to reset password for user. Please try again.', 'error');
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

                    toastAlert('Unable to update user. Please try again.', 'error');
                    return false;
                }).catch(error => handleError(error));
        },
    },
};

export default users;