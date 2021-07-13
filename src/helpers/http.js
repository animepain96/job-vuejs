import axios from "axios";
import env from "../config/env";
import store from "@/store";
import router from "@/router/index"
import {toastAlert} from "@/helpers/alert";
import i18n from "@/helpers/i18n";

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
                    toastAlert(i18n.tc('alerts.auth.login'), 'error');
                }
                break;
            case 403:
                router.push({path: '/'});
                toastAlert(i18n.tc('alerts.auth.permission'), 'error');
                break;
            case 422:
                toastAlert(i18n.tc('alerts.auth.data_invalid'), 'error');
                break;
            default:
                toastAlert(i18n.tc('alerts.app.server_error'), 'error');
                break;
        }
    } else {
        toastAlert(i18n.tc('alerts.app.server_error'), 'error');
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
