// Estado global para la paginación, búsqueda y ordenamiento de marcas
const estado = {
	search: "",
	sort: "nombre",
	order: "ASC",
	page: 1,
	per_page: 8
};

let debounceTimer = null;

$(document).ready(() => {
	// Inicializar iconos Lucide
	if (typeof lucide !== "undefined") {
		lucide.createIcons();
	}

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

	// Manejar el click en el botón de eliminar (Abre modal SweetAlert2 de confirmación)
	$(document).on("click", ".btn-eliminar-marca", function () {
		const id = $(this).data("id");
		const nombre = $(this).data("nombre");

		confirmarEliminacionMarca(id, nombre);
	});

	// Evento de búsqueda por input con debounce
	$("#searchInput").on("input", () => {
		clearTimeout(debounceTimer);
		$("#searchInput").closest(".relative").addClass("searching");

		debounceTimer = setTimeout(() => {
			estado.search = $("#searchInput").val().trim();
			estado.page = 1;
			cargarMarcas();
		}, 400);
	});

	// Evento de ordenamiento al clickear en la columna Nombre
	$("#thNombre").on("click", function () {
		if (estado.sort === "nombre") {
			estado.order = estado.order === "ASC" ? "DESC" : "ASC";
		} else {
			estado.sort = "nombre";
			estado.order = "ASC";
		}
		estado.page = 1;
		cargarMarcas();
	});

	// Evento de paginación
	$("#paginas").on("click", "button[data-page]", function () {
		const newPage = parseInt($(this).data("page"));
		if (!isNaN(newPage) && newPage > 0) {
			estado.page = newPage;
			cargarMarcas();
		}
	});
});

/**
 * Carga todas las marcas desde el backend aplicando paginación y búsqueda
 */
function cargarMarcas() {
	const $tabla = $("#tablaMarcas");
	const $searchInput = $("#searchInput");

	$tabla.html(`
        <tr>
            <td colspan="2" class="py-6 text-center text-gray-500">
                <div class="flex flex-col items-center gap-2">
                    <i data-lucide="loader-2" class="w-6 h-6 animate-spin text-green-600"></i>
                    Cargando marcas...
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
			accion: "listar_marcas",
			search: estado.search,
			sort: estado.sort,
			order: estado.order,
			page: estado.page,
			per_page: estado.per_page
		},
		success: (response) => {
			if (response.success && response.marcas) {
				$tabla.empty();

				if (response.marcas.length === 0) {
					$tabla.append(`
                        <tr>
                            <td colspan="2" class="py-6 text-center text-gray-500">
                                No se encontraron marcas.
                            </td>
                        </tr>
                    `);
					$("#infoRegistros").text("No hay registros");
					$("#paginas").empty();
					if (typeof lucide !== "undefined") {
						lucide.createIcons();
					}
					return;
				}

				response.marcas.forEach((marca) => {
					$tabla.append(`
                        <tr class="hover:bg-gray-50 transition-colors">
                            <td class="py-3 px-4 font-medium text-gray-800">${escapeHtml(marca.nombre)}</td>
                            <td class="py-3 px-4 text-center flex items-center justify-center gap-2">
                                <button class="btn-editar-marca text-blue-600 hover:text-blue-800 transition-colors p-1" 
                                        data-id="${marca.id}" 
                                        data-nombre="${escapeHtml(marca.nombre)}"
                                        title="Editar Marca">
                                    <i data-lucide="pencil" class="w-4 h-4"></i>
                                </button>
                                <button class="btn-eliminar-marca text-red-600 hover:text-red-800 transition-colors p-1" 
                                        data-id="${marca.id}" 
                                        data-nombre="${escapeHtml(marca.nombre)}"
                                        title="Eliminar Marca">
                                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                                </button>
                            </td>
                        </tr>
                    `);
				});

				renderizarPaginacion(response.pagination);
				actualizarIndicadorOrden();
			} else {
				mostrarError("Error al cargar marcas", response.error);
			}
		},
		error: (xhr) => {
			const errorMsg =
				xhr.responseJSON?.error || "Error de red al conectar con el servidor.";
			mostrarError("Error al cargar marcas", errorMsg);
		},
		complete: () => {
			$searchInput.closest(".relative").removeClass("searching");
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

	const prevDisabled =
		page <= 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-green-100";
	$paginas.append(`
        <button class="px-3 py-1 rounded border border-gray-300 text-sm ${prevDisabled}" data-page="${page - 1}" ${page <= 1 ? "disabled" : ""}>
            <i data-lucide="chevron-left" class="w-4 h-4"></i>
        </button>
    `);

	for (let i = startPage; i <= endPage; i++) {
		const activeClass =
			i === page
				? "bg-green-600 text-white border-green-600"
				: "border-gray-300 hover:bg-green-100";
		$paginas.append(`
            <button class="px-3 py-1 rounded border text-sm ${activeClass}" data-page="${i}">
                ${i}
            </button>
        `);
	}

	const nextDisabled =
		page >= total_pages
			? "opacity-50 cursor-not-allowed"
			: "hover:bg-green-100";
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
 * Actualiza el indicador visual de ordenación en la cabecera Nombre
 */
function actualizarIndicadorOrden() {
	const $th = $("#thNombre");
	$th.removeClass("asc desc");
	$th.addClass(estado.order.toLowerCase());

	$th.find(".sort-icon i").attr(
		"data-lucide",
		estado.order === "ASC" ? "chevron-up" : "chevron-down"
	);
	if (typeof lucide !== "undefined") {
		lucide.createIcons();
	}
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

/**
 * Muestra el diálogo SweetAlert2 para confirmar la eliminación de una marca
 */
function confirmarEliminacionMarca(id, nombre) {
	const theme = obtenerSwalTheme();

	Swal.fire({
		title: "Eliminar Marca",
		text: `¿Está seguro que desea eliminar la marca "${nombre}"? Esta acción no podrá deshacerse.`,
		icon: "warning",
		showCancelButton: true,
		confirmButtonText: "Eliminar",
		cancelButtonText: "Cancelar",
		confirmButtonColor: "#ef4444",
		cancelButtonColor: "#6b7280",
		background: theme.background,
		color: theme.color,
	}).then((result) => {
		if (result.isConfirmed) {
			eliminarMarca(id);
		}
	});
}

/**
 * Envía la petición AJAX con método DELETE para eliminar la marca
 */
function eliminarMarca(id) {
	$.ajax({
		url: `../../../../backend/api.php?accion=eliminar_marca&id=${id}`,
		type: "DELETE",
		dataType: "json",
	})
		.done((response) => {
			// El backend responde con {"message": "..."} si es exitoso o con error en message según el código HTTP.
			Swal.fire({
				icon: "success",
				title: "¡Eliminada!",
				text: response.message || "Marca eliminada correctamente.",
				timer: 2000,
				showConfirmButton: false,
				...obtenerSwalTheme(),
			});

			// Recargar la tabla
			cargarMarcas();
		})
		.fail((xhr) => {
			const errorMsg =
				xhr.responseJSON?.message || xhr.responseJSON?.error || "Error de red al intentar eliminar.";
			mostrarError("No se pudo eliminar la marca", errorMsg);
		});
}
