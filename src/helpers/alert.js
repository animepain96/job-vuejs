import Swal from 'sweetalert2';

const toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: false,
})

export const toastAlert = (message, status) => {
    return toast.fire({
        icon: status,
        title: message ?? 'There was an error. Please try again.',
    });
}