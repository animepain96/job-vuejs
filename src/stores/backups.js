import HTTP from "@/helpers/http";
import {DELETE_BACKUP, GET_BACKUP, MANUAL_BACKUP} from "@/constants/backupsAPI";
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
                        let backups = state.backups;
                        backups.name.filter(backup => !backups.includes(backup.name));
                        commit('setBackups', backups);

                        toastAlert('The selected items was deleted successfully.', 'success');
                        return true;
                    }

                    toastAlert('There was an error. Please try again.', 'error');
                    return false;
                }).catch(() => {
                    toastAlert('There was an error. Please try again.', 'error');
                    return false;
                });
        },
    },
};

export default backups;