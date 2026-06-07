/**
 * Métodos de Pago Management Logic - Forrajería
 */

$(document).ready(() => {
    // Inicializar iconos Lucide
    lucide.createIcons();

    // Cargar la lista inicial de métodos de pago
    cargarMetodosPago();

    // Configurar validador
    const validator = new FormValidator("#formMetodoPago");

    // Manejar el submit del formulario
    $("#formMetodoPago").on("submit", (e) => {
        e.preventDefault();

        if (validator.validate()) {
            guardarMetodoPago(validator);
        }
    });
});

/**
 * Carga todos los métodos de pago desde el backend
 */
function cargarMetodosPago() {
    const $tabla = $("#tablaMetodosPago");

    $.get("../../../../backend/api.php?accion=listar_metodos_pago")
        .done((response) => {
            if (response.success) {
                $tabla.empty();

                if (response.metodos.length === 0) {
                    $tabla.append(`
                        <tr>
                            <td colspan="2" class="py-6 text-center text-gray-500">
                                No hay métodos de pago registrados en el sistema.
                            </td>
                        </tr>
                    `);
                    return;
                }

                response.metodos.forEach((metodo) => {
                    $tabla.append(`
                        <tr class="hover:bg-gray-50 transition-colors">
                            <td class="py-3 px-4 font-medium text-gray-800">${escapeHtml(metodo.nombre)}</td>
                            <td class="py-3 px-4 text-center text-gray-500">${metodo.id}</td>
                        </tr>
                    `);
                });

                // Re-inicializar iconos Lucide si inyectamos nuevos en la tabla
                lucide.createIcons();
            } else {
                mostrarError("Error al cargar métodos de pago", response.error);
            }
        })
        .fail((xhr) => {
            const errorMsg = xhr.responseJSON?.error || "Error de red al conectar con el servidor.";
            mostrarError("Error al cargar métodos de pago", errorMsg);
        });
}

/**
 * Envía la petición para guardar un nuevo método de pago
 */
function guardarMetodoPago(validator) {
    const nombre = $("#nombre").val().trim();

    $.ajax({
        url: "../../../../backend/api.php?accion=crear_metodo_pago",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({ nombre: nombre }),
        dataType: "json",
    })
        .done((response) => {
            if (response.success) {
                Swal.fire({
                    icon: "success",
                    title: "¡Guardado!",
                    text: response.message || "Método de pago creado correctamente.",
                    timer: 2000,
                    showConfirmButton: false,
                    ...obtenerSwalTheme(),
                });

                // Limpiar formulario y errores
                $("#nombre").val("");
                validator.clearAllErrors();

                // Recargar la tabla
                cargarMetodosPago();
            } else {
                mostrarError("No se pudo crear el método de pago", response.error);
            }
        })
        .fail((xhr) => {
            const errorMsg = xhr.responseJSON?.error || "Error de red al intentar guardar.";
            mostrarError("Error del servidor", errorMsg);
        });
}

/**
 * Obtiene el tema (background y color) para SweetAlert2 según el modo oscuro
 */
function obtenerSwalTheme() {
    const isDark = $("body").hasClass("dark");
    return {
        background: isDark ? "#1f2937" : "#ffffff",
        color: isDark ? "#f3f4f6" : "#1f2937",
    };
}

/**
 * Muestra una alerta SweetAlert2 con el error
 */
function mostrarError(titulo, mensaje) {
    Swal.fire({
        icon: "error",
        title: titulo,
        text: mensaje || "Ocurrió un error inesperado.",
        confirmButtonColor: "#15803d",
        ...obtenerSwalTheme(),
    });
}

/**
 * Escapa caracteres HTML para prevenir XSS
 */
function escapeHtml(text) {
    const map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
}
