import HTTP from "@/helpers/http";
import {CREATE_CUSTOMER, CUSTOMER_LIST, DELETE_CUSTOMER, UPDATE_CUSTOMER} from "@/constants/customersAPI";
import {toastAlert} from "@/helpers/alert";

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
            }).catch(() => {
                toastAlert('There was an error. Please try again.', 'error');
                return false;
            });
        },
        update({commit, state}, payload) {
            return HTTP(true).patch(UPDATE_CUSTOMER(payload.id), payload, {
                headers: {
                    Accept: 'application/json',
                }
            }).then(response => {
                if (response.data.status && response.data.status === 'success') {
                    let customers = state.customers.map((customer) => {
                        if (customer.id === response.data.data.id) {
                            return response.data.data;
                        }
                        return customer;
                    });

                    commit('updateList', customers);

                    return true;
                }

                toastAlert('There was an error. Please try again.', 'error');
                return false;
            }).catch(() => {
                toastAlert('There was an error. Please try again.', 'error');
                return false;
            });
        },
        delete({commit, state}, customer) {
            return HTTP(true).delete(DELETE_CUSTOMER(customer.id), {
                headers: {
                    Accept: 'application/json',
                }
            }).then(response => {
                if (response.data.status && response.data.status === 'success') {
                    let customers = state.customers.filter((item) => {
                        if (customer.id !== item.id) {
                            return item;
                        }
                    });

                    commit('updateList', customers);
                    toastAlert('The customer was deleted successfully.', 'success');

                    return true;
                }

                toastAlert('There was an error. Please try again.', 'error')
                return false;
            }).catch(() => {
                toastAlert('There was an error. Please try again.', 'error')
                return false;
            });
        },
        create({commit, state}, customer) {
            return HTTP(true).post(CREATE_CUSTOMER, {
                name: customer.name,
            }, {
                headers: {
                    Accept: 'application/json',
                }
            }).then(response => {
                if (response.data.status && response.data.status === 'success') {
                    let customers = state.customers;
                    customers.push(response.data.data);

                    commit('updateList', customers);
                    toastAlert('The customer was created successfully.', 'success');
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

export default customers;