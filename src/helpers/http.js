import axios from "axios";
import env from "../config/env";
import store from "@/store";
import router from "@/router/index"
import {toastAlert} from "@/helpers/alert";

const configs = {
    baseURL: env.API,
    headers: {
        Accept: 'application/json',
    },
};

export const handleError = (error) => {
    if (error && error.response) {
        switch (error.response.status) {
            case 401:
                if (store.state.auth.token) {
                    store.dispatch('auth/logout');
                    router.push({path: '/login'});
                    toastAlert('Please login to your account before continue.', 'error');
                }
                break;
            case 403:
                router.push({path: '/'});
                toastAlert('You do not have permission to view this page.', 'error');
                break;
            case 422:
                toastAlert('Your data is invalid.', 'error');
                break;
            default:
                toastAlert('There was an error. Please try again.', 'error');
                break;
        }
    } else {
        toastAlert('Server error. Please try again.', 'error');
    }

    return false;
};

const HTTP = function (auth = false) {
    if (auth) {
        const token = store.state.auth.token;
        configs.headers.Authorization = `Bearer ${token}`;
    }

    return axios.create(configs);
}

export default HTTP;