const env = {
    API: () => {
        if(process.env.NODE_ENV === 'development') {
            return 'http://job-laravel.work';
        }
        return 'https://job-laravel.herokuapp.com';
    },
};

export default env;
