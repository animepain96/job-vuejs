import HTTP, {handleError} from "@/helpers/http";
import {DELETE_BACKUP, DOWNLOAD_BACKUP, GET_BACKUP, MANUAL_BACKUP} from "@/constants/backupsAPI";
import {toastAlert} from "@/helpers/alert";
import i18n from "@/helpers/i18n";

const backups = {
    namespaced: true,
    state: {
        loading: false,
        backups: [],
    },
    mutations: {
        setBackups(state, backups) {
            state.backups = backups;
        },
        setLoading(state, loading) {
            state.loading = loading;
        },
    },
    actions: {
        getBackups({commit}) {
            commit('setLoading', true);
            return HTTP(true)
                .get(GET_BACKUP)
                .then(response => {
                    if (response.data.status === 'success') {
                        commit('setBackups', response.data.data);
                        return true;
                    }

                    toastAlert(i18n.tc('alerts.app.server_error'), 'error');
                    return false;
                })
                .catch(error => handleError(error))
                .finally(() => commit('setLoading', false));
        },
        manualBackup({dispatch, commit}) {
            commit('setLoading', true);
            return HTTP(true)
                .get(MANUAL_BACKUP)
                .then(response => {
                    if (response.data.status === 'success') {
                        dispatch('getBackups');

                        toastAlert(i18n.tc('alerts.backups.success_create'), 'success');
                        return true;
                    }

                    toastAlert(i18n.tc('alerts.app.server_error'), 'error');
                    return false;
                })
                .catch(error => handleError(error))
                .finally(() => commit('setLoading', false));
        },
        deleteBackup({commit, state}, backups) {
            commit('setLoading', true);
            return HTTP(true)
                .post(DELETE_BACKUP, backups)
                .then(response => {
                    if (response.data.status === 'success') {
                        let stateBackups = state.backups.filter(backup => {
                            return !backups.name.includes(backup.name);
                        });
                        commit('setBackups', stateBackups);

                        toastAlert(i18n.tc('alerts.backups.success_delete'), 'success');
                        return true;
                    }

                    toastAlert(i18n.tc('alerts.app.server_error'), 'error');
                    return false;
                })
                .catch(error => handleError(error))
                .finally(() => commit('setLoading', false));
        },
        downloadBackup({commit}, backup) {
            commit('setLoading', true);
            return HTTP(true)
                .get(DOWNLOAD_BACKUP, {
                params: backup,
                responseType: 'arraybuffer',
            })
                .then(response => {
                    if (response.data) {
                        const blob = new Blob([response.data], {type: response.headers['content-type']});
                        const link = document.createElement('a');
                        link.href = window.URL.createObjectURL(blob);
                        link.download = backup.name;
                        document.body.appendChild(link);

                        link.click();

                        link.remove();
                        return true;
                    }

                    toastAlert(i18n.tc('alerts.app.server_error'), 'error');
                    return false;
                })
                .catch(error => handleError(error))
                .finally(() => commit('setLoading', false));
        },
    },
};

export default backups;
