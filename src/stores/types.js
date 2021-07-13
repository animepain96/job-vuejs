import HTTP, {handleError} from "@/helpers/http";
import {TYPE_LIST, UPDATE_TYPE, DELETE_TYPE, CREATE_TYPE} from "@/constants/typeAPI";
import {toastAlert} from "@/helpers/alert";
import i18n from "@/helpers/i18n";

const types = {
    namespaced: true,
    state: {
        types: [],
    },
    mutations: {
        updateList(state, types) {
            state.types = types;
        },
    },
    actions: {
        getList({commit}) {
            return HTTP(true).get(TYPE_LIST, {
                headers: {
                    Accept: 'application/json',
                },
            }).then(response => {
                if(response.data.status === 'success'){
                    commit('updateList', response.data.data);
                    return true;
                }

                return false;
            }).catch(error => handleError(error));
        },
        update({commit, state}, payload){
            return HTTP(true).patch(UPDATE_TYPE(payload.ID), {
                Name: payload.Name,
            }, {
                headers: {
                    Accept: 'application/json',
                }
            }).then(response => {
                if (response.data.status && response.data.status === 'success') {
                    let types = state.types.map((type) => {
                        if (type.ID === response.data.data.ID) {
                            return response.data.data;
                        }
                        return type;
                    });

                    commit('updateList', types);

                    return true;
                }

                toastAlert(i18n.tc('alerts.app.server_error'), 'error');
                return false;
            }).catch(error => handleError(error));
        },
        delete({commit, state}, type) {
            return HTTP(true).delete(DELETE_TYPE(type.ID), {
                headers: {
                    Accept: 'application/json',
                }
            }).then(response => {
                if (response.data.status && response.data.status === 'success') {
                    let types = state.types.filter((item) => {
                        if (type.ID !== item.ID) {
                            return item;
                        }
                    });

                    commit('updateList', types);
                    toastAlert(i18n.tc('alerts.types.success_delete'), 'error');

                    return true;
                }

                toastAlert(i18n.tc('alerts.app.server_error'), 'error');
                return false;
            }).catch(error => handleError(error));
        },
        create({commit, state}, type) {
            return HTTP(true).post(CREATE_TYPE, {
                Name: type.Name,
            }, {
                headers: {
                    Accept: 'application/json',
                }
            }).then(response => {
                if (response.data.status && response.data.status === 'success') {
                    let types = state.types;
                    types.push(response.data.data);

                    commit('updateList', types);
                    toastAlert(i18n.tc('alerts.types.success_create'), 'error');

                    return true;
                }
                toastAlert(i18n.tc('alerts.app.server_error'), 'error');
                return false;
            }).catch(error => handleError(error));
        },
    },
};

export default types;
