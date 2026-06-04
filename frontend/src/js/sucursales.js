/**
 * Gestión de Sucursales - JavaScript
 *
 * Maneja la creación, listado con paginación, búsqueda y filtros de sucursales.
 */

$(document).ready(() => {
	// Inicializar componentes Lucide
	if (typeof lucide !== "undefined") {
		lucide.createIcons();
	}

	// Elementos del DOM
	const $form = $("#formSucursal");
	const $tabla = $("#tablaSucursales");
	const $searchInput = $("#searchInput");
	const $estadoFilter = $("#estadoFilter");
	const $paginationControls = $("#paginationControls");
	const $infoRegistros = $("#infoRegistros");
	const $paginas = $("#paginas");

	// API base
	const API_BASE = "../../../../backend/api.php";

	// Estado de la tabla
	const estado = {
		search: "",
		estado: "todas",
		sort: "nombre",
		order: "ASC",
		page: 1,
		per_page: 10,
	};

	let formValidator = null;
	let debounceTimer = null;

	// ========================================
	// VALIDACIÓN PERSONALIZADA
	// ========================================

	// Agregar regla custom para teléfono
	if (window.FormValidator) {
		formValidator = new FormValidator("#formSucursal", {
			validateOnSubmit: true,
			validateOnBlur: true,
			validateOnInput: true,
		});

		// Override de validateField para manejar la regla 'phone'
		formValidator.validateField = function (name) {
			const field = this.fields[name];
			if (!field) return true;

			const value = field.element.value.trim();
			const rules = field.rules;

			// Limpiar errores
			this.clearError(name);

			// Required
			if (rules.required && !value) {
				this.setError(name, "Este campo es requerido");
				return false;
			}

			// Si no tiene valor y no es required, no validar más
			if (!value && !rules.required) {
				return true;
			}

			// Email
			if (rules.email && value && !this.isValidEmail(value)) {
				this.setError(name, "Ingresá un email válido");
				return false;
			}

			// Min length
			if (rules.minLength && value.length < parseInt(rules.minLength)) {
				this.setError(name, `Mínimo ${rules.minLength} caracteres`);
				return false;
			}

			// Max length
			if (rules.maxLength && value.length > parseInt(rules.maxLength)) {
				this.setError(name, `Máximo ${rules.maxLength} caracteres`);
				return false;
			}

			// Phone custom
			if (rules.phone && value) {
				const phoneRegex = /^[0-9]{8,15}$/;
				if (!phoneRegex.test(value)) {
					this.setError(name, "Solo números, entre 8 y 15 dígitos");
					return false;
				}
			}

			return true;
		};

		// Manejar envío del formulario
		$form.on("submit", (e) => {
			e.preventDefault();

			if (!formValidator.validate()) {
				return false;
			}

			// Recoger datos
			const datos = {
				nombre: $("#nombre").val().trim(),
				direccion: $("#direccion").val().trim() || null,
				telefono: $("#telefono").val().trim() || null,
				email: $("#email").val().trim() || null,
			};

			// Validación adicional en cliente (teléfono)
			if (datos.telefono) {
				const phoneRegex = /^[0-9]{8,15}$/;
				if (!phoneRegex.test(datos.telefono)) {
					Swal.fire({
						icon: "error",
						title: "Error de validación",
						text: "El teléfono debe contener solo números (8-15 dígitos)",
						confirmButtonText: "Aceptar",
					});
					return;
				}
			}

			// Validación adicional en cliente (email)
			if (datos.email) {
				const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
				if (!emailRegex.test(datos.email)) {
					Swal.fire({
						icon: "error",
						title: "Error de validación",
						text: "El email no tiene un formato válido",
						confirmButtonText: "Aceptar",
					});
					return;
				}
			}

			enviarFormulario(datos);
		});
	} else {
		// Fallback si no hay FormValidator
		$form.on("submit", (e) => {
			e.preventDefault();

			const nombre = $("#nombre").val().trim();
			if (!nombre) {
				Swal.fire({
					icon: "error",
					title: "Error",
					text: "El nombre es obligatorio",
					confirmButtonText: "Aceptar",
				});
				return;
			}

			const datos = {
				nombre: nombre,
				direccion: $("#direccion").val().trim() || null,
				telefono: $("#telefono").val().trim() || null,
				email: $("#email").val().trim() || null,
			};

			enviarFormulario(datos);
		});
	}

	// ========================================
	// ENVÍO A LA API (CREAR)
	// ========================================

	function enviarFormulario(datos) {
		$.ajax({
			url: API_BASE + "?accion=crear_sucursal",
			type: "POST",
			contentType: "application/json",
			data: JSON.stringify(datos),
			success: (respuesta) => {
				if (respuesta.success) {
					// Recargar listado con el estado actual
					cargarSucursales();

					Swal.fire({
						icon: "success",
						title: "¡Éxito!",
						text: respuesta.message || "Sucursal creada correctamente",
						confirmButtonText: "Aceptar",
					}).then(() => {
						// Limpiar formulario
						$form[0].reset();
						if (formValidator) {
							formValidator.clearAllErrors();
						}
					});
				} else {
					Swal.fire({
						icon: "error",
						title: "Error",
						text: respuesta.error || "No se pudo crear la sucursal",
						confirmButtonText: "Aceptar",
					});
				}
			},
			error: (xhr) => {
				let mensaje = "Error de conexión";

				if (xhr.responseJSON && xhr.responseJSON.error) {
					mensaje = xhr.responseJSON.error;
				} else if (xhr.status === 403) {
					mensaje = "No tienes permisos para realizar esta acción";
				} else if (xhr.status === 401) {
					mensaje = "Debes iniciar sesión para continuar";
					setTimeout(() => {
						window.location.href = "../login.php";
					}, 1500);
				}

				Swal.fire({
					icon: "error",
					title: "Error",
					text: mensaje,
					confirmButtonText: "Aceptar",
				});
			},
		});
	}

	// ========================================
	// LISTADO CON PAGINACIÓN Y FILTROS
	// ========================================

	function cargarSucursales() {
		// Mostrar loader en la tabla
		$tabla.html(`
            <tr>
                <td colspan="7" class="py-6 text-center text-gray-500">
                    <div class="flex flex-col items-center gap-2">
                        <i data-lucide="loader-2" class="w-6 h-6 animate-spin text-green-600"></i>
                        Cargando sucursales...
                    </div>
                </td>
            </tr>
        `);
		lucide.createIcons();

		$.ajax({
			url: API_BASE,
			type: "GET",
			data: {
				accion: "listar_sucursales",
				search: estado.search,
				estado: estado.estado,
				sort: estado.sort,
				order: estado.order,
				page: estado.page,
				per_page: estado.per_page,
			},
			success: (respuesta) => {
				if (respuesta.success && respuesta.data) {
					renderizarSucursales(respuesta.data);
					renderizarPaginacion(respuesta.pagination);
					actualizarIndicadorOrden();
				}
			},
			error: (xhr) => {
				$tabla.html(`
                    <tr>
                        <td colspan="7" class="py-6 text-center text-red-500">
                            <div class="flex flex-col items-center gap-2">
                                <i data-lucide="alert-circle" class="w-6 h-6"></i>
                                Error al cargar las sucursales
                            </div>
                        </td>
                    </tr>
                `);
				lucide.createIcons();
			},
			complete: () => {
				// Quitar spinner de búsqueda
				$searchInput.closest(".relative").removeClass("searching");
			},
		});
	}

	function renderizarSucursales(sucursales) {
		if (!sucursales || sucursales.length === 0) {
			$tabla.html(`
                <tr>
                    <td colspan="7" class="py-6 text-center text-gray-500">
                        <div class="flex flex-col items-center gap-2">
                            <i data-lucide="package-x" class="w-6 h-6"></i>
                            No hay sucursales que coincidan con los filtros
                        </div>
                    </tr>
                </tr>
            `);
			lucide.createIcons();
			return;
		}

		let html = "";
		sucursales.forEach((sucursal) => {
			const estadoBadge = sucursal.activa
				? '<span class="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Activa</span>'
				: '<span class="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">Inactiva</span>';

			const fechaCreacion = new Date(sucursal.created_at).toLocaleDateString(
				"es-AR",
				{
					day: "2-digit",
					month: "2-digit",
					year: "numeric",
				},
			);

			html += `
                <tr class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td class="py-3 px-4">${sucursal.id}</td>
                    <td class="py-3 px-4 font-medium">${escapeHtml(sucursal.nombre)}</td>
                    <td class="py-3 px-4">${sucursal.direccion ? escapeHtml(sucursal.direccion) : '<span class="text-gray-400">—</span>'}</td>
                    <td class="py-3 px-4">${sucursal.telefono ? escapeHtml(sucursal.telefono) : '<span class="text-gray-400">—</span>'}</td>
                    <td class="py-3 px-4">${sucursal.email ? escapeHtml(sucursal.email) : '<span class="text-gray-400">—</span>'}</td>
                    <td class="py-3 px-4">${estadoBadge}</td>
                    <td class="py-3 px-4">${fechaCreacion}</td>
                </tr>
            `;
		});

		$tabla.html(html);
		lucide.createIcons();
	}

	function renderizarPaginacion(pagination) {
		if (!pagination) return;

		const { total, page, per_page, total_pages } = pagination;
		const inicio = (page - 1) * per_page + 1;
		const fin = Math.min(page * per_page, total);

		// Info de registros
		if (total === 0) {
			$infoRegistros.text("No hay registros");
		} else {
			$infoRegistros.text(`Mostrando ${inicio}-${fin} de ${total} registros`);
		}

		// Botones de paginación
		$paginas.empty();

		if (total_pages <= 1) {
			return; // No mostrar paginación si hay una sola página
		}

		const maxBotones = 5;
		let startPage = Math.max(1, page - Math.floor(maxBotones / 2));
		const endPage = Math.min(total_pages, startPage + maxBotones - 1);

		if (endPage - startPage < maxBotones - 1) {
			startPage = Math.max(1, endPage - maxBotones + 1);
		}

		// Botón anterior
		const prevDisabled =
			page <= 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-green-100";
		$paginas.append(`
            <button class="px-3 py-1 rounded border border-gray-300 text-sm ${prevDisabled}" data-page="${page - 1}" ${page <= 1 ? "disabled" : ""}>
                <i data-lucide="chevron-left" class="w-4 h-4"></i>
            </button>
        `);

		// Botones de páginas
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

		// Botón siguiente
		const nextDisabled =
			page >= total_pages
				? "opacity-50 cursor-not-allowed"
				: "hover:bg-green-100";
		$paginas.append(`
            <button class="px-3 py-1 rounded border border-gray-300 text-sm ${nextDisabled}" data-page="${page + 1}" ${page >= total_pages ? "disabled" : ""}>
                <i data-lucide="chevron-right" class="w-4 h-4"></i>
            </button>
        `);

		lucide.createIcons();
	}

	// ========================================
	// EVENTOS DE CONTROLES
	// ========================================

	// Búsqueda con debounce
	$searchInput.on("input", () => {
		clearTimeout(debounceTimer);
		$searchInput.closest(".relative").addClass("searching");

		debounceTimer = setTimeout(() => {
			estado.search = $searchInput.val().trim();
			estado.page = 1; // Reset a página 1 en nueva búsqueda
			cargarSucursales();
		}, 400);
	});

	// Filtro por estado
	$estadoFilter.on("change", () => {
		estado.estado = $estadoFilter.val();
		estado.page = 1;
		cargarSucursales();
	});

	// Ordenamiento por columnas
	$tabla
		.closest(".overflow-x-auto")
		.find("th.sortable")
		.on("click", function () {
			const $th = $(this);
			const column = $th.data("sort");

			if (!column) return;

			// Toggle orden
			if (estado.sort === column) {
				estado.order = estado.order === "ASC" ? "DESC" : "ASC";
			} else {
				estado.sort = column;
				estado.order = "ASC";
			}

			estado.page = 1;
			cargarSucursales();
		});

	// Paginación (delegated events)
	$paginas.on("click", "button[data-page]", function () {
		const newPage = parseInt($(this).data("page"));
		if (!isNaN(newPage) && newPage > 0) {
			estado.page = newPage;
			cargarSucursales();
		}
	});

	// Actualizar indicador visual de orden
	function actualizarIndicadorOrden() {
		$("th.sortable").removeClass("asc desc");
		$(`th.sortable[data-sort="${estado.sort}"]`).addClass(
			estado.order.toLowerCase(),
		);

		// Cambiar icono según dirección
		$(`th.sortable[data-sort="${estado.sort}"] .sort-icon i`).attr(
			"data-lucide",
			estado.order === "ASC" ? "chevron-up" : "chevron-down",
		);
		lucide.createIcons();
	}

	// ========================================
	// HELPERS
	// ========================================

	function escapeHtml(texto) {
		const div = document.createElement("div");
		div.textContent = texto;
		return div.innerHTML;
	}

	// Cargar sucursales al iniciar
	cargarSucursales();
});
