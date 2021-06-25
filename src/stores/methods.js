import {HTTP} from "@/helpers/http";
import {DELETE_METHOD, METHOD_LIST, UPDATE_METHOD, CREATE_METHOD} from "@/constants/methodAPI";
import {toastAlert} from "@/helpers/alert";

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
            return HTTP.get(METHOD_LIST, {
                headers: {
                    Accept: 'application/json',
                }
            }).then(response => {
                commit('updateList', response.data);
                return true;
            }).catch(() => {
                toastAlert('There was an error. Please try again.', 'error');
                return false;
            });
        },
        update({commit, state}, payload){
            return HTTP.patch(UPDATE_METHOD(payload.id), {
                name: payload.name,
            }, {
                headers: {
                    Accept: 'application/json',
                }
            }).then(response => {
                if (response.data.status && response.data.status === 'success') {
                    let methods = state.methods.map((method) => {
                        if (method.id === response.data.data.id) {
                            return response.data.data;
                        }
                        return method;
                    });

                    commit('updateList', methods);
                    toastAlert('The method was updated successfully.', 'success')

                    return true;
                }

                toastAlert('There was an error. Please try again.', 'error');
                return false;
            }).catch(() => {
                toastAlert('There was an error. Please try again.', 'error');
                return false;
            });
        },
        delete({commit, state}, method) {
            return HTTP.delete(DELETE_METHOD(method.id), {
                headers: {
                    Accept: 'application/json',
                }
            }).then(response => {
                if (response.data.status && response.data.status === 'success') {
                    let methods = state.methods.filter((item) => {
                        if (method.id !== item.id) {
                            return item;
                        }
                    });

                    commit('updateList', methods);
                    toastAlert('The method was deleted successfully.', 'success');

                    return true;
                }

                toastAlert('There was an error. Please try again.', 'error')
                return false;
            }).catch(() => {
                toastAlert('There was an error. Please try again.', 'error')
                return false;
            });
        },
        create({commit, state}, method) {
            return HTTP.post(CREATE_METHOD, {
                name: method.name,
            }, {
                headers: {
                    Accept: 'application/json',
                }
            }).then(response => {
                if (response.data.status && response.data.status === 'success') {
                    let methods = state.methods;
                    methods.push(response.data.data);

                    commit('updateList', methods);
                    toastAlert('The method was created successfully.', 'success');
                    return true;
                }
                toastAlert('There was an error. Please try again.', 'error');
                return false;
            }).catch(() => {
                toastAlert('There was an error. Please try again.', 'error');
                return false;
            });
        },
    },
};

    export default methods;