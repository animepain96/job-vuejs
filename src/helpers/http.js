import axios from "axios";
import env from "../config/env";

export const HTTP = axios.create({
    baseURL: env.API,
    headers: {

    },
});