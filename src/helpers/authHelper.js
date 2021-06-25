import store from '@/store';

const authHelper = {
    isLogged: function() {
        if(store.state.auth.token) {
            return true;
        } else if(window.$cookies.get('token')) {
            store.state.auth.token = window.$cookies.get('token');
            return true;
        }
        return false;
    }
};

export default authHelper;