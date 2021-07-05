import axios from "axios";
import env from "../config/env";
import store from "@/store";
import router from "@/router/index"
import {toastAlert} from "@/helpers/alert";

const instance = axios.create({
    baseURL: env.API,
    headers: {
        Accept: 'application/json',
    },
});

instance.interceptors.response.use((response) => response, (error) => {
    if(error && error.response) {
        switch (error.response.status) {
            case 401:
                if (store.state.auth.token) {
                    store.dispatch('auth/logout');
                    router.push({path: '/login'});
                    toastAlert('Please login to your account before continue.', 'error');
                }
                break;
            default:
                toastAlert('There was an error. Please try again.', 'error');
                break;
        }
    } else {
        return Promise.reject(error);
    }
});

const HTTP = function (auth = false) {
    if (auth) {
        const token = store.state.auth.token;
        instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    return instance;
}

export default HTTP;