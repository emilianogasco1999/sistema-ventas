/**
 * Marcas Management Logic - Forrajería
 */

$(document).ready(() => {
	// Inicializar iconos Lucide
	lucide.createIcons();

	// Cargar la lista inicial de marcas
	cargarMarcas();

	// Configurar validador
	const validator = new FormValidator("#formMarca");

	// Manejar el submit del formulario
	$("#formMarca").on("submit", (e) => {
		e.preventDefault();

		if (validator.validate()) {
			guardarMarca(validator);
		}
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
                            <td class="py-6 text-center text-gray-500">
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
 * Envía la petición para guardar una nueva marca
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
