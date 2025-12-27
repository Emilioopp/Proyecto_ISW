import Swal from 'sweetalert2';

export function showErrorAlert(title, text) {
  Swal.fire({
    icon: 'error',
    title: title,
    text: text,
    confirmButtonText: 'Aceptar',
    confirmButtonColor: '#d33'
  });
}

export function showQuestionAlert(idEvaluacion) {
  return Swal.fire({
    title: '¿Estás seguro?',
    text: "Esta acción no se puede deshacer",
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    // Si el usuario hace clic en "Sí"
    if (result.isConfirmed) {
      
      // Llamada al backend (usando ruta relativa)
      // Nota: Si tu backend está en otro puerto, configura el Proxy en vite.config.js
      fetch(`/evaluaciones/eliminar/${idEvaluacion}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
      })
      .then(response => {
        // response.ok es true si el estatus es 200-299
        if (response.ok) {
            Swal.fire(
                '¡Eliminado!', 
                'La evaluación ha sido eliminada.', 
                'success'
            ).then(() => {
                // Recargamos la página para ver los cambios
                window.location.reload(); 
            });
        } else {
            // Si el servidor responde con error (ej: 404, 500)
            Swal.fire('Error', 'No se pudo eliminar el registro. El servidor respondió con error.', 'error');
        }
      })
      .catch(error => {
        // Si hay un error de red (servidor apagado, sin internet)
        console.error('Error de red:', error);
        Swal.fire('Error', 'Hubo un problema de conexión con el servidor', 'error');
      });
    }
  });
}

export function showSuccessAlert(title, text) {
  Swal.fire({
    icon: 'success',
    title: title,
    text: text,
    confirmButtonText: 'Aceptar',
    confirmButtonColor: '#3085d6',
    timer: 3000
  });
}

export function deleteDataAlert(onConfirm) {
  Swal.fire({
    title: '¿Estás seguro?',
    text: "Esta acción no se puede deshacer",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      onConfirm();
    }
  });
}
