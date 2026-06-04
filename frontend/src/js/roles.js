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
	$("#formRol").on("submit", (e) => {
		e.preventDefault();

		if (validator.validate()) {
			guardarRol(validator);
		}
	});

	// Manejar el click en el botón de editar
	$(document).on("click", ".btn-editar-rol", function () {
		const id = $(this).data("id");
		const nombre = $(this).data("nombre");
		const activo = $(this).data("activo") == 1; // Convertir a booleano

		abrirModalEdicion(id, nombre, activo);
	});

	// Manejar el click en el botón de eliminar
	$(document).on("click", ".btn-eliminar-rol", function () {
		const id = $(this).data("id");
		const nombre = $(this).data("nombre");

		confirmarEliminacionRol(id, nombre);
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
                            <td colspan="5" class="py-6 text-center text-gray-500">
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
						creador =
							`${rol.creador_nombre || ""} ${rol.creador_apellido || ""}`.trim();
					}

					// Formatear la fecha
					const fecha = rol.created_at ? formatearFecha(rol.created_at) : "—";

					// Formatear estado
					const badgeEstado =
						rol.activo == 1
							? `<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-600">
                             <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                             Activo
                           </span>`
							: `<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600">
                             <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                             Inactivo
                           </span>`;

					// Solo mostramos el botón de eliminar si no es el rol de Administrador principal (id = 1)
					const botonEliminar =
						rol.id == 1
							? ""
							: `<button class="btn-eliminar-rol text-red-600 hover:text-red-800 transition-colors p-1" 
                                   data-id="${rol.id}" 
                                   data-nombre="${escapeHtml(rol.nombre)}"
                                   title="Eliminar Rol">
                               <i data-lucide="trash-2" class="w-4 h-4"></i>
                           </button>`;

					$tabla.append(`
                        <tr class="hover:bg-gray-50 transition-colors">
                            <td class="py-3 px-4 font-medium text-gray-800">${escapeHtml(rol.nombre)}</td>
                            <td class="py-3 px-4">${badgeEstado}</td>
                            <td class="py-3 px-4 text-gray-500">${escapeHtml(creador)}</td>
                            <td class="py-3 px-4 text-gray-500">${fecha}</td>
                            <td class="py-3 px-4 text-center flex items-center justify-center gap-2">
                                <button class="btn-editar-rol text-blue-600 hover:text-blue-800 transition-colors p-1" 
                                        data-id="${rol.id}" 
                                        data-nombre="${escapeHtml(rol.nombre)}" 
                                        data-activo="${rol.activo}"
                                        title="Editar Rol">
                                    <i data-lucide="pencil" class="w-4 h-4"></i>
                                </button>
                                ${botonEliminar}
                            </td>
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
			const errorMsg =
				xhr.responseJSON?.error || "Error de red al conectar con el servidor.";
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
		dataType: "json",
	})
		.done((response) => {
			if (response.success) {
				Swal.fire({
					icon: "success",
					title: "¡Guardado!",
					text: response.message || "Rol creado correctamente.",
					timer: 2000,
					showConfirmButton: false,
					...obtenerSwalTheme(),
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
			const errorMsg =
				xhr.responseJSON?.error || "Error de red al intentar guardar.";
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

/**
 * Abre el modal de SweetAlert2 para editar un rol
 */
function abrirModalEdicion(id, nombre, activo) {
	const esAdmin = id === 1;
	const isDark = $("body").hasClass("dark");
	const theme = obtenerSwalTheme();

	Swal.fire({
		title: "Editar Rol",
		background: theme.background,
		color: theme.color,
		html: `
            <div class="text-left py-2">
                <div class="mb-4">
                    <label for="swal-nombre" class="block text-sm font-semibold mb-1" style="color: ${isDark ? "#e5e7eb" : "#374151"} !important;">Nombre del Rol *</label>
                    <input type="text" id="swal-nombre" 
                           class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all" 
                           style="background-color: ${isDark ? "#111827" : "#ffffff"} !important; color: ${isDark ? "#ffffff" : "#111827"} !important; border-color: ${isDark ? "#374151" : "#d1d5db"} !important;"
                           value="${nombre}" ${esAdmin ? "disabled" : ""} placeholder="Ej. Supervisor">
                    <span id="swal-error-nombre" class="text-red-500 text-xs mt-1 hidden"></span>
                </div>
                <div class="flex items-center gap-2 mt-4">
                    <input type="checkbox" id="swal-activo" 
                           class="w-4 h-4 text-green-600 border rounded focus:ring-green-500" 
                           style="background-color: ${isDark ? "#111827" : "#ffffff"} !important; border-color: ${isDark ? "#374151" : "#d1d5db"} !important; accent-color: #16a34a !important; color-scheme: ${isDark ? "dark" : "light"} !important;"
                           ${activo ? "checked" : ""} ${esAdmin ? "disabled" : ""}>
                    <label for="swal-activo" class="text-sm font-semibold" style="color: ${isDark ? "#e5e7eb" : "#374151"} !important;">Rol Activo</label>
                </div>
                ${
									esAdmin
										? `
                    <div class="mt-4 p-3 rounded-lg border text-xs font-medium" 
                         style="background-color: ${isDark ? "#2d2013" : "#fffbeb"} !important; border-color: ${isDark ? "#78350f" : "#fef3c7"} !important; color: ${isDark ? "#fcd34d" : "#b45309"} !important;">
                        Nota: El rol Administrador principal no puede ser renombrado ni desactivado por seguridad.
                    </div>
                `
										: ""
								}
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
			const nuevoActivo = document.getElementById("swal-activo").checked;
			const errorSpan = document.getElementById("swal-error-nombre");

			errorSpan.classList.add("hidden");
			errorSpan.textContent = "";

			if (!nuevoNombre) {
				errorSpan.textContent = "El nombre del rol es requerido.";
				errorSpan.classList.remove("hidden");
				return false;
			}
			if (nuevoNombre.length < 3 || nuevoNombre.length > 50) {
				errorSpan.textContent = "El nombre debe tener entre 3 y 50 caracteres.";
				errorSpan.classList.remove("hidden");
				return false;
			}
			if (!/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ _-]+$/u.test(nuevoNombre)) {
				errorSpan.textContent =
					"Formato inválido. Solo se permiten letras, números, espacios, guiones y guiones bajos.";
				errorSpan.classList.remove("hidden");
				return false;
			}

			return { nombre: nuevoNombre, activo: nuevoActivo };
		},
	}).then((result) => {
		if (result.isConfirmed) {
			actualizarRol(id, result.value.nombre, result.value.activo);
		}
	});
}

/**
 * Envía la petición AJAX para actualizar el rol
 */
function actualizarRol(id, nombre, activo) {
	$.ajax({
		url: "../../../../backend/api.php?accion=editar_rol",
		type: "POST",
		contentType: "application/json",
		data: JSON.stringify({ id: id, nombre: nombre, activo: activo }),
		dataType: "json",
	})
		.done((response) => {
			if (response.success) {
				Swal.fire({
					icon: "success",
					title: "¡Actualizado!",
					text: response.message || "Rol actualizado correctamente.",
					timer: 2000,
					showConfirmButton: false,
					...obtenerSwalTheme(),
				});

				// Recargar la tabla
				cargarRoles();
			} else {
				mostrarError("No se pudo actualizar el rol", response.error);
			}
		})
		.fail((xhr) => {
			const errorMsg =
				xhr.responseJSON?.error || "Error de red al intentar actualizar.";
			mostrarError("Error del servidor", errorMsg);
		});
}

/**
 * Muestra el diálogo SweetAlert2 para confirmar la eliminación de un rol
 */
function confirmarEliminacionRol(id, nombre) {
	const theme = obtenerSwalTheme();

	Swal.fire({
		title: "¿Estás seguro?",
		text: `Vas a eliminar el rol "${nombre}". Esta acción no se puede deshacer si tiene dependencias en el futuro.`,
		icon: "warning",
		showCancelButton: true,
		confirmButtonText: "Sí, eliminar",
		cancelButtonText: "Cancelar",
		confirmButtonColor: "#ef4444",
		cancelButtonColor: "#6b7280",
		background: theme.background,
		color: theme.color,
	}).then((result) => {
		if (result.isConfirmed) {
			eliminarRol(id);
		}
	});
}

/**
 * Envía la petición AJAX para eliminar lógicamente el rol
 */
function eliminarRol(id) {
	$.ajax({
		url: "../../../../backend/api.php?accion=eliminar_rol",
		type: "POST",
		contentType: "application/json",
		data: JSON.stringify({ id: id }),
		dataType: "json",
	})
		.done((response) => {
			if (response.success) {
				Swal.fire({
					icon: "success",
					title: "¡Eliminado!",
					text: response.message || "Rol eliminado correctamente.",
					timer: 2000,
					showConfirmButton: false,
					...obtenerSwalTheme(),
				});

				// Recargar la tabla
				cargarRoles();
			} else {
				mostrarError("No se pudo eliminar el rol", response.error);
			}
		})
		.fail((xhr) => {
			const errorMsg =
				xhr.responseJSON?.error || "Error de red al intentar eliminar.";
			mostrarError("Error del servidor", errorMsg);
		});
}
