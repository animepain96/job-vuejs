import axios from "axios";
import env from "../config/env";
import store from "@/store";

const HTTP = (auth = false) => {
    const configs = {
        baseURL: env.API,
        headers: {

        },
    };
    if(auth) {
        const token = store.state.auth.token;
        configs.headers.Authorization = `Bearer ${token}`;
    }
    return axios.create(configs);
}

export default HTTP;