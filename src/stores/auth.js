import HTTP from "@/helpers/http";
import {CHANGE_PASSWORD, GET_USER, POST_LOGIN} from "@/constants/authAPI";
import {toastAlert} from "@/helpers/alert";
import router from "@/router/index";

const auth = {
    namespaced: true,
    state: {
        user: null,
        token: null,
    },
    mutations: {
        setAuth(state, payload) {
            state.user = payload.user;
            state.token = payload.token;
        },
        setUser(state, user) {
            state.user = user;
        },
    },
    actions: {
        postLogin({commit}, payload) {
            return HTTP().post(POST_LOGIN, payload, {
                headers: {
                    Accept: 'application/json',
                },
            },).then(response => {
                if (response.data.status === 'success') {
                    commit('setAuth', {user: response.data.data.user, token: response.data.data.access_token});
                    window.$cookies.set('token', response.data.data.access_token);
                    return true;
                } else {
                    toastAlert('Your email or password is invalid. Please try again.', 'error');
                    return false;
                }
            }).catch((error) => {
                if (error.response) {
                    if (error.response.status === 401) {
                        toastAlert('Your email or password is invalid. Please try again.', 'error');
                        return false;
                    }
                }
                toastAlert('There was an error. Please try again.', 'error');
                return false;
            });
        },
        logout({commit}) {
            commit('setAuth', {user: null, token: null});
            window.$cookies.remove('token');
            router.push('/login');
        },
        getUser({commit}, token) {
            return HTTP().get(GET_USER, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
                .then(response => {
                    if (response.data.status === 'success') {
                        commit('setAuth', {user: response.data.data, token: token});
                        return true;
                    }

                    toastAlert('There was an error. Please try again.', 'error');
                    return false;
                }).catch(() => {
                    toastAlert('There was an error. Please try again.', 'error');
                    return false;
                });
        },
        changePassword({dispatch}, payload) {
            return HTTP(true).patch(CHANGE_PASSWORD, payload)
                .then(response => {
                    if (response.data.status === 'success') {
                        toastAlert('The password was successfully changed. Please login again.', 'success');
                        dispatch('logout');
                        return true;
                    }

                    toastAlert('There was an error. Please try again.', 'error');
                    return false;
                }).catch(() => {
                    toastAlert('There was an error. Please try again.', 'error');
                    return false;
                });
        }
    },
};

export default auth;