import Swal from 'sweetalert2';

const toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: false,
});

const confirm = Swal.mixin({

});

export const toastAlert = (message, status) => {
    return toast.fire({
        icon: status,
        title: message ?? 'There was an error. Please try again.',
    });
}

export const confirmAlert = (title, confirmText, cancelText, status) => {
    return confirm.fire({
        title: title,
        icon: status,
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: confirmText,
        cancelButtonText: cancelText,
    });
}
