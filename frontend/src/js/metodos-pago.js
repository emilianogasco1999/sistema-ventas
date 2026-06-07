/**
 * Métodos de Pago Management Logic - Forrajería
 */

// Estado global para la paginación de métodos de pago
const estado = {
    page: 1,
    per_page: 8
};

$(document).ready(() => {
    // Inicializar iconos Lucide
    if (typeof lucide !== "undefined") {
        lucide.createIcons();
    }

    // Cargar la lista inicial de métodos de pago
    cargarMetodosPago();

    // Configurar validador
    const validator = new FormValidator("#formMetodoPago");

    // Manejar el submit del formulario (Creación)
    $("#formMetodoPago").on("submit", (e) => {
        e.preventDefault();

        if (validator.validate()) {
            guardarMetodoPago(validator);
        }
    });

    // Evento de paginación al hacer clic en los botones
    $("#paginas").on("click", "button[data-page]", function () {
        const newPage = parseInt($(this).data("page"));
        if (!isNaN(newPage) && newPage > 0) {
            estado.page = newPage;
            cargarMetodosPago();
        }
    });

    // Manejar el clic en el botón de editar (Abre modal)
    $(document).on("click", ".btn-editar-metodo", function () {
        const id = $(this).data("id");
        const nombre = $(this).data("nombre");
        abrirModalEdicion(id, nombre);
    });
});

/**
 * Carga todos los métodos de pago desde el backend aplicando paginación
 */
function cargarMetodosPago() {
    const $tabla = $("#tablaMetodosPago");

    $tabla.html(`
        <tr>
            <td colspan="3" class="py-6 text-center text-gray-500">
                <div class="flex flex-col items-center gap-2">
                    <i data-lucide="loader-2" class="w-6 h-6 animate-spin text-green-600"></i>
                    Cargando métodos de pago...
                </div>
            </td>
        </tr>
    `);
    
    if (typeof lucide !== "undefined") {
        lucide.createIcons();
    }

    $.ajax({
        url: "../../../../backend/api.php",
        type: "GET",
        data: {
            accion: "listar_metodos_pago",
            page: estado.page,
            per_page: estado.per_page
        },
        success: (response) => {
            if (response.success && response.metodos) {
                $tabla.empty();

                if (response.metodos.length === 0) {
                    $tabla.append(`
                        <tr>
                            <td colspan="3" class="py-6 text-center text-gray-500">
                                No existen métodos de pago registrados.
                            </td>
                        </tr>
                    `);
                    $("#infoRegistros").text("No hay registros");
                    $("#paginas").empty();
                    return;
                }

                response.metodos.forEach((metodo) => {
                    $tabla.append(`
                        <tr class="hover:bg-gray-50 transition-colors">
                            <td class="py-3 px-4 font-medium text-gray-800">${escapeHtml(metodo.nombre)}</td>
                            <td class="py-3 px-4 text-center text-gray-500">${metodo.id}</td>
                            <td class="py-3 px-4 text-center flex items-center justify-center gap-2">
                                <button class="btn-editar-metodo text-blue-600 hover:text-blue-800 transition-colors p-1" 
                                        data-id="${metodo.id}" 
                                        data-nombre="${escapeHtml(metodo.nombre)}"
                                        title="Editar Método de Pago">
                                    <i data-lucide="pencil" class="w-4 h-4"></i>
                                </button>
                            </td>
                        </tr>
                    `);
                });

                renderizarPaginacion(response.pagination);
            } else {
                mostrarError("Error al cargar métodos de pago", response.error);
            }
        },
        error: (xhr) => {
            const errorMsg = xhr.responseJSON?.error || "Error de red al conectar con el servidor.";
            mostrarError("Error al cargar métodos de pago", errorMsg);
        }
    });
}

/**
 * Renderiza dinámicamente los botones de control de paginación
 */
function renderizarPaginacion(pagination) {
    if (!pagination) return;

    const $infoRegistros = $("#infoRegistros");
    const $paginas = $("#paginas");

    const { total, page, per_page, total_pages } = pagination;
    const inicio = (page - 1) * per_page + 1;
    const fin = Math.min(page * per_page, total);

    if (total === 0) {
        $infoRegistros.text("No hay registros");
    } else {
        $infoRegistros.text(`Mostrando ${inicio}-${fin} de ${total} registros`);
    }

    $paginas.empty();

    if (total_pages <= 1) {
        return;
    }

    const maxBotones = 5;
    let startPage = Math.max(1, page - Math.floor(maxBotones / 2));
    const endPage = Math.min(total_pages, startPage + maxBotones - 1);

    if (endPage - startPage < maxBotones - 1) {
        startPage = Math.max(1, endPage - maxBotones + 1);
    }

    // Botón Anterior
    const prevDisabled = page <= 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-green-100";
    $paginas.append(`
        <button class="px-3 py-1 rounded border border-gray-300 text-sm ${prevDisabled}" data-page="${page - 1}" ${page <= 1 ? "disabled" : ""}>
            <i data-lucide="chevron-left" class="w-4 h-4"></i>
        </button>
    `);

    // Páginas numéricas
    for (let i = startPage; i <= endPage; i++) {
        const activeClass = i === page
            ? "bg-green-600 text-white border-green-600"
            : "border-gray-300 hover:bg-green-100";
        $paginas.append(`
            <button class="px-3 py-1 rounded border text-sm ${activeClass}" data-page="${i}">
                ${i}
            </button>
        `);
    }

    // Botón Siguiente
    const nextDisabled = page >= total_pages ? "opacity-50 cursor-not-allowed" : "hover:bg-green-100";
    $paginas.append(`
        <button class="px-3 py-1 rounded border border-gray-300 text-sm ${nextDisabled}" data-page="${page + 1}" ${page >= total_pages ? "disabled" : ""}>
            <i data-lucide="chevron-right" class="w-4 h-4"></i>
        </button>
    `);

    if (typeof lucide !== "undefined") {
        lucide.createIcons();
    }
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

                // Forzar ir a la primera página al guardar para ver el nuevo registro en orden alfabético
                estado.page = 1;
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
 * Abre el modal de SweetAlert2 para editar un método de pago
 */
function abrirModalEdicion(id, nombre) {
    const isDark = $("body").hasClass("dark");
    const theme = obtenerSwalTheme();

    Swal.fire({
        title: "Editar Método de Pago",
        background: theme.background,
        color: theme.color,
        html: `
            <div class="text-left py-2">
                <div class="mb-4">
                    <label for="swal-nombre" class="block text-sm font-semibold mb-1" style="color: ${isDark ? "#e5e7eb" : "#374151"} !important;">Nombre del Método de Pago *</label>
                    <input type="text" id="swal-nombre" 
                           class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all" 
                           style="background-color: ${isDark ? "#111827" : "#ffffff"} !important; color: ${isDark ? "#ffffff" : "#111827"} !important; border-color: ${isDark ? "#374151" : "#d1d5db"} !important;"
                           value="${escapeHtml(nombre)}" placeholder="Ej. Tarjeta">
                    <span id="swal-error-nombre" class="text-red-500 text-xs mt-1 hidden"></span>
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: "Guardar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#15803d",
        cancelButtonColor: "#ef4444",
        focusConfirm: false,
        preConfirm: () => {
            const nuevoNombre = document.getElementById("swal-nombre").value.trim();
            const errorSpan = document.getElementById("swal-error-nombre");

            errorSpan.classList.add("hidden");
            errorSpan.textContent = "";

            if (!nuevoNombre) {
                errorSpan.textContent = "Debe ingresar un nombre para el método de pago.";
                errorSpan.classList.remove("hidden");
                return false;
            }
            if (nuevoNombre.length < 3 || nuevoNombre.length > 50) {
                errorSpan.textContent = "El nombre debe tener entre 3 y 50 caracteres.";
                errorSpan.classList.remove("hidden");
                return false;
            }
            if (!/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ _-]+$/u.test(nuevoNombre)) {
                errorSpan.textContent = "Formato inválido. Solo se permiten letras, números, espacios, guiones y guiones bajos.";
                errorSpan.classList.remove("hidden");
                return false;
            }

            return { nombre: nuevoNombre };
        },
    }).then((result) => {
        if (result.isConfirmed) {
            actualizarMetodoPago(id, result.value.nombre);
        }
    });
}

/**
 * Envía la petición AJAX para actualizar el método de pago
 */
function actualizarMetodoPago(id, nombre) {
    $.ajax({
        url: "../../../../backend/api.php?accion=editar_metodo_pago",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({ id: id, nombre: nombre }),
        dataType: "json",
    })
        .done((response) => {
            if (response.success) {
                Swal.fire({
                    icon: "success",
                    title: "¡Actualizado!",
                    text: response.message || "Método de pago actualizado correctamente.",
                    timer: 2000,
                    showConfirmButton: false,
                    ...obtenerSwalTheme(),
                });

                // Recargar la tabla manteniendo la página actual
                cargarMetodosPago();
            } else {
                mostrarError("No se pudo actualizar el método de pago", response.error);
            }
        })
        .fail((xhr) => {
            const errorMsg = xhr.responseJSON?.error || "Error de red al intentar actualizar.";
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
