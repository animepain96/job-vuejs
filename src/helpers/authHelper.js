import store from '@/store';

const authHelper = {
    isLogged: async () => {
        if (store.state.auth.token) {
            return true;
        } else if (window.$cookies.get('token')) {
            store.commit('auth/setToken', window.$cookies.get('token'));
            return await store.dispatch('auth/getUser');
        }
        return false;
    },
    isAdmin: () => {
        return store.state.auth.user && store.state.auth.user.role === 'admin';
    },
};

export default authHelper;