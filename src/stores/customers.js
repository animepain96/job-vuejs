import HTTP, {handleError} from "@/helpers/http";
import {CREATE_CUSTOMER, CUSTOMER_LIST, DELETE_CUSTOMER, UPDATE_CUSTOMER} from "@/constants/customersAPI";
import {toastAlert} from "@/helpers/alert";
import i18n from "@/helpers/i18n";

const customers = {
    namespaced: true,
    state: {
        customers: [],
    },
    mutations: {
        updateList(state, customers) {
            state.customers = customers;
        },
    },
    actions: {
        getList({commit}) {
            return HTTP(true).get(CUSTOMER_LIST, {
                headers: {
                    Accept: 'application/json',
                }
            }).then(response => {
                commit('updateList', response.data);
                return true;
            }).catch(error => handleError(error));
        },
        update({commit, state}, payload) {
            return HTTP(true).patch(UPDATE_CUSTOMER(payload.ID), payload, {
                headers: {
                    Accept: 'application/json',
                }
            }).then(response => {
                if (response.data.status && response.data.status === 'success') {
                    let customers = state.customers.map((customer) => {
                        if (customer.ID === response.data.data.ID) {
                            return response.data.data;
                        }
                        return customer;
                    });

                    commit('updateList', customers);

                    return true;
                }

                toastAlert(i18n.tc('alerts.app.server_error'), 'error');
                return false;
            }).catch(error => handleError(error));
        },
        delete({commit, state}, customer) {
            return HTTP(true).delete(DELETE_CUSTOMER(customer.ID), {
                headers: {
                    Accept: 'application/json',
                }
            }).then(response => {
                if (response.data.status && response.data.status === 'success') {
                    let customers = state.customers.filter((item) => {
                        if (customer.ID !== item.ID) {
                            return item;
                        }
                    });

                    commit('updateList', customers);

                    toastAlert(i18n.tc('alerts.customers.success_delete'), 'success');
                    return true;
                }

                toastAlert(i18n.tc('alerts.app.server_error'), 'error')
                return false;
            }).catch(error => handleError(error));
        },
        create({commit, state}, customer) {
            return HTTP(true).post(CREATE_CUSTOMER, {
                Name: customer.Name,
            }, {
                headers: {
                    Accept: 'application/json',
                }
            }).then(response => {
                if (response.data.status && response.data.status === 'success') {
                    let customers = state.customers;
                    customers.push(response.data.data);

                    commit('updateList', customers);
                    toastAlert(i18n.tc('alerts.customers.success_create'), 'success');
                    return true;
                }
                toastAlert(i18n.tc('alerts.app.server_error'), 'error');
                return false;
            }).catch(error => handleError(error));
        }
    },
};

export default customers;
