/**
 * Roles Management Logic - Forrajería
 */

$(document).ready(() => {
    // Inicializar iconos Lucide
    lucide.createIcons();

    // Cargar la lista inicial de roles
    cargarRoles();

    // Configurar validador
    const validator = new FormValidator("#formRol");

    // Manejar el submit del formulario
    $("#formRol").on("submit", function (e) {
        e.preventDefault();

        if (validator.validate()) {
            guardarRol(validator);
        }
    });
});

/**
 * Carga todos los roles desde el backend
 */
function cargarRoles() {
    const $tabla = $("#tablaRoles");

    $.get("../../../../backend/api.php?accion=listar_roles")
        .done((response) => {
            if (response.success) {
                $tabla.empty();

                if (response.roles.length === 0) {
                    $tabla.append(`
                        <tr>
                            <td colspan="4" class="py-6 text-center text-gray-500">
                                No hay roles registrados en el sistema.
                            </td>
                        </tr>
                    `);
                    return;
                }

                response.roles.forEach((rol) => {
                    // Formatear el nombre del creador
                    let creador = "Sistema";
                    if (rol.creador_nombre || rol.creador_apellido) {
                        creador = `${rol.creador_nombre || ""} ${rol.creador_apellido || ""}`.trim();
                    }

                    // Formatear la fecha
                    const fecha = rol.created_at ? formatearFecha(rol.created_at) : "—";

                    // Formatear estado
                    const badgeEstado = rol.activo == 1
                        ? `<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-600">
                             <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                             Activo
                           </span>`
                        : `<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600">
                             <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                             Inactivo
                           </span>`;

                    $tabla.append(`
                        <tr class="hover:bg-gray-50 transition-colors">
                            <td class="py-3 px-4 font-medium text-gray-800">${escapeHtml(rol.nombre)}</td>
                            <td class="py-3 px-4">${badgeEstado}</td>
                            <td class="py-3 px-4 text-gray-500">${escapeHtml(creador)}</td>
                            <td class="py-3 px-4 text-gray-500">${fecha}</td>
                        </tr>
                    `);
                });

                // Re-inicializar iconos Lucide si inyectamos nuevos en la tabla
                lucide.createIcons();
            } else {
                mostrarError("Error al cargar roles", response.error);
            }
        })
        .fail((xhr) => {
            const errorMsg = xhr.responseJSON?.error || "Error de red al conectar con el servidor.";
            mostrarError("Error al cargar roles", errorMsg);
        });
}

/**
 * Envía la petición para guardar un nuevo rol
 */
function guardarRol(validator) {
    const nombre = $("#nombre").val().trim();

    $.ajax({
        url: "../../../../backend/api.php?accion=crear_rol",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({ nombre: nombre }),
        dataType: "json"
    })
        .done((response) => {
            if (response.success) {
                Swal.fire({
                    icon: "success",
                    title: "¡Guardado!",
                    text: response.message || "Rol creado correctamente.",
                    timer: 2000,
                    showConfirmButton: false
                });

                // Limpiar formulario y errores
                $("#nombre").val("");
                validator.clearAllErrors();

                // Recargar la tabla
                cargarRoles();
            } else {
                mostrarError("No se pudo crear el rol", response.error);
            }
        })
        .fail((xhr) => {
            const errorMsg = xhr.responseJSON?.error || "Error de red al intentar guardar.";
            mostrarError("Error del servidor", errorMsg);
        });
}

/**
 * Auxiliar para formatear fecha a formato DD/MM/AAAA HH:MM
 */
function formatearFecha(dateString) {
    try {
        const parts = dateString.split(/[- :]/);
        if (parts.length >= 5) {
            // Asume formato YYYY-MM-DD HH:MM:SS
            return `${parts[2]}/${parts[1]}/${parts[0]} ${parts[3]}:${parts[4]}`;
        }
        const d = new Date(dateString);
        if (!isNaN(d.getTime())) {
            const dia = String(d.getDate()).padStart(2, "0");
            const mes = String(d.getMonth() + 1).padStart(2, "0");
            const anio = d.getFullYear();
            const hora = String(d.getHours()).padStart(2, "0");
            const minutos = String(d.getMinutes()).padStart(2, "0");
            return `${dia}/${mes}/${anio} ${hora}:${minutos}`;
        }
        return dateString;
    } catch (e) {
        return dateString;
    }
}

/**
 * Muestra una alerta SweetAlert2 con el error
 */
function mostrarError(titulo, mensaje) {
    Swal.fire({
        icon: "error",
        title: titulo,
        text: mensaje || "Ocurrió un error inesperado.",
        confirmButtonColor: "#15803d"
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
        "'": "&#039;"
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
}
