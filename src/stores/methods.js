import HTTP, {handleError} from "@/helpers/http";
import {DELETE_METHOD, METHOD_LIST, UPDATE_METHOD, CREATE_METHOD} from "@/constants/methodAPI";
import {toastAlert} from "@/helpers/alert";
import i18n from "@/helpers/i18n";

const methods = {
    namespaced: true,
    state: {
        methods: [],
    },
    mutations: {
        updateList(state, methods) {
            state.methods = methods;
        },
    },
    actions: {
        getList({commit}) {
            return HTTP(true).get(METHOD_LIST, {
                headers: {
                    Accept: 'application/json',
                }
            }).then(response => {
                commit('updateList', response.data);
                return true;
            }).catch(error => handleError(error));
        },
        update({commit, state}, payload){
            return HTTP(true).patch(UPDATE_METHOD(payload.ID), {
                Name: payload.Name,
            }, {
                headers: {
                    Accept: 'application/json',
                }
            }).then(response => {
                if (response.data.status && response.data.status === 'success') {
                    let methods = state.methods.map((method) => {
                        if (method.ID === response.data.data.ID) {
                            return response.data.data;
                        }
                        return method;
                    });

                    commit('updateList', methods);

                    return true;
                }

                toastAlert(i18n.tc('alerts.app.server_error'), 'error')
                return false;
            }).catch(error => handleError(error));
        },
        delete({commit, state}, method) {
            return HTTP(true).delete(DELETE_METHOD(method.ID), {
                headers: {
                    Accept: 'application/json',
                }
            }).then(response => {
                if (response.data.status && response.data.status === 'success') {
                    let methods = state.methods.filter((item) => {
                        if (method.ID !== item.ID) {
                            return item;
                        }
                    });

                    commit('updateList', methods);
                    toastAlert(i18n.tc('alerts.methods.success_delete'), 'success');

                    return true;
                }

                toastAlert(i18n.tc('alerts.app.server_error'), 'error')
                return false;
            }).catch(error => handleError(error));
        },
        create({commit, state}, method) {
            return HTTP(true).post(CREATE_METHOD, {
                Name: method.Name,
            }, {
                headers: {
                    Accept: 'application/json',
                }
            }).then(response => {
                if (response.data.status && response.data.status === 'success') {
                    let methods = state.methods;
                    methods.push(response.data.data);

                    commit('updateList', methods);
                    toastAlert(i18n.tc('alerts.methods.success_create'), 'success');

                    return true;
                }
                toastAlert(i18n.tc('alerts.app.server_error'), 'error')
                return false;
            }).catch(error => handleError(error));
        },
    },
};

    export default methods;
