import HTTP from "@/helpers/http";
import {DELETE_BACKUP, DOWNLOAD_BACKUP, GET_BACKUP, MANUAL_BACKUP} from "@/constants/backupsAPI";
import {toastAlert} from "@/helpers/alert";

const backups = {
    namespaced: true,
    state: {
        backups: [],
    },
    mutations: {
        setBackups(state, backups) {
            state.backups = backups;
        },
    },
    actions: {
        getBackups({commit}) {
            return HTTP(true).get(GET_BACKUP)
                .then(response => {
                    if (response.data.status === 'success') {
                        commit('setBackups', response.data.data);
                        return true;
                    }

                    toastAlert('There was an error. Please try again.', 'error');
                    return false;
                })
                .catch(() => {
                    toastAlert('There was an error. Please try again.', 'error');
                    return false;
                });
        },
        manualBackup({dispatch}) {
            return HTTP(true).get(MANUAL_BACKUP)
                .then(response => {
                    if (response.data.status === 'success') {
                        dispatch('getBackups');

                        toastAlert('The backup was created successfully.', 'success');
                        return true;
                    }

                    toastAlert('There was an error. Please try again.', 'error');
                    return false;
                })
                .catch(() => {
                    toastAlert('There was an error. Please try again.', 'error');
                    return false;
                });
        },
        deleteBackup({commit, state}, backups) {
            return HTTP(true).post(DELETE_BACKUP, backups)
                .then(response => {
                    if (response.data.status === 'success') {
                        let stateBackups = state.backups.filter(backup => {
                            return !backups.name.includes(backup.name);
                        });
                        commit('setBackups', stateBackups);

                        toastAlert('The selected items was deleted successfully.', 'success');
                        return true;
                    }

                    toastAlert('There was an error. Please try again.', 'error');
                    return false;
                }).catch((error) => {
                    console.log(error);
                    toastAlert('There was an error. Please try again.', 'error');
                    return false;
                });
        },
        downloadBackup({commit}, backup) {
            return HTTP(true).get(DOWNLOAD_BACKUP, {
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

                    toastAlert('The request backup could not be found.', 'error');
                    return false;
                }).catch(() => {
                    return false;
                });
        },
    },
};

export default backups;