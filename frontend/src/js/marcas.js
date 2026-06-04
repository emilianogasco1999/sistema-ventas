/**
 * Marcas Management Logic - Forrajería
 */

$(document).ready(() => {
	// Inicializar iconos Lucide
	lucide.createIcons();

	// Cargar la lista inicial de marcas
	cargarMarcas();

	// Configurar validador para el formulario de creación
	const validator = new FormValidator("#formMarca");

	// Manejar el submit del formulario (Creación únicamente)
	$("#formMarca").on("submit", (e) => {
		e.preventDefault();

		if (validator.validate()) {
			guardarMarca(validator);
		}
	});

	// Manejar el click en el botón de editar (Abre modal SweetAlert2)
	$(document).on("click", ".btn-editar-marca", function () {
		const id = $(this).data("id");
		const nombre = $(this).data("nombre");

		abrirModalEdicion(id, nombre);
	});
});

/**
 * Carga todas las marcas desde el backend
 */
function cargarMarcas() {
	const $tabla = $("#tablaMarcas");

	$.get("../../../../backend/api.php?accion=listar_marcas")
		.done((response) => {
			if (response.success) {
				$tabla.empty();

				if (response.marcas.length === 0) {
					$tabla.append(`
                        <tr>
                            <td colspan="2" class="py-6 text-center text-gray-500">
                                No hay marcas registradas en el sistema.
                            </td>
                        </tr>
                    `);
					return;
				}

				response.marcas.forEach((marca) => {
					$tabla.append(`
                        <tr class="hover:bg-gray-50 transition-colors">
                            <td class="py-3 px-4 font-medium text-gray-800">${escapeHtml(marca.nombre)}</td>
                            <td class="py-3 px-4 text-center">
                                <button class="btn-editar-marca text-blue-600 hover:text-blue-800 transition-colors p-1" 
                                        data-id="${marca.id}" 
                                        data-nombre="${escapeHtml(marca.nombre)}"
                                        title="Editar Marca">
                                    <i data-lucide="pencil" class="w-4 h-4"></i>
                                </button>
                            </td>
                        </tr>
                    `);
				});

				// Re-inicializar iconos Lucide
				lucide.createIcons();
			} else {
				mostrarError("Error al cargar marcas", response.error);
			}
		})
		.fail((xhr) => {
			const errorMsg =
				xhr.responseJSON?.error || "Error de red al conectar con el servidor.";
			mostrarError("Error al cargar marcas", errorMsg);
		});
}

/**
 * Envía la petición para guardar una nueva marca (Creación)
 */
function guardarMarca(validator) {
	const nombre = $("#nombre").val().trim();

	$.ajax({
		url: "../../../../backend/api.php?accion=crear_marca",
		type: "POST",
		contentType: "application/json",
		data: JSON.stringify({ nombre: nombre }),
		dataType: "json",
	})
		.done((response) => {
			if (response.success) {
				Swal.fire({
					icon: "success",
					title: "¡Guardada!",
					text: response.message || "Marca creada correctamente.",
					timer: 2000,
					showConfirmButton: false,
					...obtenerSwalTheme(),
				});

				// Limpiar formulario y errores
				$("#nombre").val("");
				validator.clearAllErrors();

				// Recargar la tabla
				cargarMarcas();
			} else {
				mostrarError("No se pudo crear la marca", response.error);
			}
		})
		.fail((xhr) => {
			const errorMsg =
				xhr.responseJSON?.error || "Error de red al intentar guardar.";
			mostrarError("Error del servidor", errorMsg);
		});
}

/**
 * Abre el modal de SweetAlert2 para editar una marca (Igual a Roles)
 */
function abrirModalEdicion(id, nombre) {
	const isDark = $("body").hasClass("dark");
	const theme = obtenerSwalTheme();

	Swal.fire({
		title: "Editar Marca",
		background: theme.background,
		color: theme.color,
		html: `
            <div class="text-left py-2">
                <div class="mb-4">
                    <label for="swal-nombre" class="block text-sm font-semibold mb-1" style="color: ${isDark ? "#e5e7eb" : "#374151"} !important;">Nombre de la Marca *</label>
                    <input type="text" id="swal-nombre" 
                           class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all" 
                           style="background-color: ${isDark ? "#111827" : "#ffffff"} !important; color: ${isDark ? "#ffffff" : "#111827"} !important; border-color: ${isDark ? "#374151" : "#d1d5db"} !important;"
                           value="${escapeHtml(nombre)}" placeholder="Ej. Purina">
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
				errorSpan.textContent = "El nombre de la marca es obligatorio.";
				errorSpan.classList.remove("hidden");
				return false;
			}
			if (nuevoNombre.length < 2 || nuevoNombre.length > 100) {
				errorSpan.textContent = "El nombre debe tener entre 2 y 100 caracteres.";
				errorSpan.classList.remove("hidden");
				return false;
			}

			return { nombre: nuevoNombre };
		},
	}).then((result) => {
		if (result.isConfirmed) {
			actualizarMarca(id, result.value.nombre);
		}
	});
}

/**
 * Envía la petición AJAX para actualizar la marca
 */
function actualizarMarca(id, nombre) {
	$.ajax({
		url: "../../../../backend/api.php?accion=actualizar_marca",
		type: "POST",
		contentType: "application/json",
		data: JSON.stringify({ id: id, nombre: nombre }),
		dataType: "json",
	})
		.done((response) => {
			if (response.success) {
				Swal.fire({
					icon: "success",
					title: "¡Actualizada!",
					text: response.message || "Marca actualizada correctamente.",
					timer: 2000,
					showConfirmButton: false,
					...obtenerSwalTheme(),
				});

				// Recargar la tabla
				cargarMarcas();
			} else {
				mostrarError("No se pudo actualizar la marca", response.error);
			}
		})
		.fail((xhr) => {
			const errorMsg =
				xhr.responseJSON?.error || "Error de red al intentar actualizar.";
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
