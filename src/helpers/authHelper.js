import store from '@/store';

const authHelper = {
    isLogged: () => {
        if(store.state.auth.token) {
            return true;
        } else if(window.$cookies.get('token')) {
            const token = window.$cookies.get('token');
            return store.dispatch('auth/getUser', token);
        }
        return false;
    }
};

export default authHelper;