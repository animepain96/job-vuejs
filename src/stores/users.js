import HTTP from "@/helpers/http";
import {GET_USERS} from "@/constants/userAPI";
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
                }).catch(() => {
                    toastAlert('Your email or password is invalid. Please try again.', 'error');
                    return false;
                });
        },
    },
};

export default users;