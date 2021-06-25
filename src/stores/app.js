const app = {
    namespaced: true,
    state: {
        isLoading: false,
    },
    mutations: {
        setLoading(state, status) {
            state.isLoading = status;
        },
    },
};

export default app;