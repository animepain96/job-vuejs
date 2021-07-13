import HTTP, {handleError} from "@/helpers/http";
import {CHANGE_PASSWORD, GET_USER, POST_LOGIN} from "@/constants/authAPI";
import {toastAlert} from "@/helpers/alert";
import i18n from "@/helpers/i18n";

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
        setToken(state, token) {
          state.token = token;
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
                }

                toastAlert(i18n.tc('alerts.auth.invalid'), 'error');
                return false;
            }).catch(error => handleError(error));
        },
        logout({commit}) {
            commit('setAuth', {user: null, token: null});
            window.$cookies.remove('token');
        },
        getUser({commit}) {
            return HTTP(true).get(GET_USER)
                .then(response => {
                    if (response.data.status === 'success') {
                        commit('setUser', response.data.data);
                        return true;
                    }

                }).catch(error => handleError(error));
        },
        changePassword({dispatch}, payload) {
            return HTTP(true).patch(CHANGE_PASSWORD, payload)
                .then(response => {
                    if (response.data.status === 'success') {
                        toastAlert(i18n.tc('alerts.auth.password'), 'success');
                        dispatch('logout');
                        return true;
                    }

                    toastAlert(i18n.tc('alerts.app.server_error'), 'error');
                    return false;
                }).catch(error => handleError(error));
        }
    },
};

export default auth;
