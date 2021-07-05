import store from '@/store';

const authHelper = {
    isLogged: () => {
        if(store.state.auth.token) {
            return true;
        } else if(window.$cookies.get('token')) {
            store.commit('auth/setAuth', {token: window.$cookies.get('token'), user: {}});
            return true;
        }
        return false;
    }
};

export default authHelper;