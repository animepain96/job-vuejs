import HTTP, {handleError} from "@/helpers/http";
import {TYPE_LIST, UPDATE_TYPE, DELETE_TYPE, CREATE_TYPE} from "@/constants/typeAPI";
import {toastAlert} from "@/helpers/alert";

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

                toastAlert('There was an error. Please try again.', 'error');
                return false;
            }).catch(error => handleError(error));
        },
        update({commit, state}, payload){
            return HTTP(true).patch(UPDATE_TYPE(payload.id), {
                name: payload.name,
            }, {
                headers: {
                    Accept: 'application/json',
                }
            }).then(response => {
                if (response.data.status && response.data.status === 'success') {
                    let types = state.types.map((type) => {
                        if (type.id === response.data.data.id) {
                            return response.data.data;
                        }
                        return type;
                    });

                    commit('updateList', types);
                    toastAlert('The type was updated successfully.', 'success')

                    return true;
                }

                toastAlert('There was an error. Please try again.', 'error');
                return false;
            }).catch(error => handleError(error));
        },
        delete({commit, state}, type) {
            return HTTP(true).delete(DELETE_TYPE(type.id), {
                headers: {
                    Accept: 'application/json',
                }
            }).then(response => {
                if (response.data.status && response.data.status === 'success') {
                    let types = state.types.filter((item) => {
                        if (type.id !== item.id) {
                            return item;
                        }
                    });

                    commit('updateList', types);
                    toastAlert('The type was deleted successfully.', 'success');

                    return true;
                }

                toastAlert('There was an error. Please try again.', 'error')
                return false;
            }).catch(error => handleError(error));
        },
        create({commit, state}, type) {
            return HTTP(true).post(CREATE_TYPE, {
                name: type.name,
            }, {
                headers: {
                    Accept: 'application/json',
                }
            }).then(response => {
                if (response.data.status && response.data.status === 'success') {
                    let types = state.types;
                    types.push(response.data.data);

                    commit('updateList', types);
                    toastAlert('The type was created successfully.', 'success');
                    return true;
                }
                toastAlert('There was an error. Please try again.', 'error');
                return false;
            }).catch(error => handleError(error));
        },
    },
};

export default types;