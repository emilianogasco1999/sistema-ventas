/**
 * Gestión de Sucursales - JavaScript
 *
 * Maneja la creación, listado con paginación, búsqueda, filtros y edición de sucursales.
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
	// VALIDACIÓN PERSONALIZADA (CREAR)
	// ========================================

	if (window.FormValidator) {
		formValidator = new FormValidator("#formSucursal", {
			validateOnSubmit: true,
			validateOnBlur: true,
			validateOnInput: true,
		});

		formValidator.validateField = function (name) {
			const field = this.fields[name];
			if (!field) return true;

			const value = field.element.value.trim();
			const rules = field.rules;

			this.clearError(name);

			if (rules.required && !value) {
				this.setError(name, "Este campo es requerido");
				return false;
			}

			if (!value && !rules.required) {
				return true;
			}

			if (rules.email && value && !this.isValidEmail(value)) {
				this.setError(name, "Ingresá un email válido");
				return false;
			}

			if (rules.minLength && value.length < parseInt(rules.minLength)) {
				this.setError(name, `Mínimo ${rules.minLength} caracteres`);
				return false;
			}

			if (rules.maxLength && value.length > parseInt(rules.maxLength)) {
				this.setError(name, `Máximo ${rules.maxLength} caracteres`);
				return false;
			}

			if (rules.phone && value) {
				const phoneRegex = /^[0-9]{8,15}$/;
				if (!phoneRegex.test(value)) {
					this.setError(name, "Solo números, entre 8 y 15 dígitos");
					return false;
				}
			}

			return true;
		};
	}

	// ========================================
	// ENVÍO FORMULARIO (CREAR)
	// ========================================

	$form.on("submit", (e) => {
		e.preventDefault();

		if (formValidator && !formValidator.validate()) {
			return;
		}

		const nombre = $("#nombre").val().trim();
		if (!nombre && formValidator) {
			return;
		}

		const datos = {
			nombre: nombre,
			direccion: $("#direccion").val().trim() || null,
			telefono: $("#telefono").val().trim() || null,
			email: $("#email").val().trim() || null,
		};

		if (datos.telefono && !/^[0-9]{8,15}$/.test(datos.telefono)) {
			Swal.fire({
				icon: "error",
				title: "Error de validación",
				text: "El teléfono debe contener solo números (8-15 dígitos)",
				confirmButtonText: "Aceptar",
			});
			return;
		}

		if (datos.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.email)) {
			Swal.fire({
				icon: "error",
				title: "Error de validación",
				text: "El email no tiene un formato válido",
				confirmButtonText: "Aceptar",
			});
			return;
		}

		enviarFormulario(datos);
	});

	function enviarFormulario(datos) {
		$.ajax({
			url: API_BASE + "?accion=crear_sucursal",
			type: "POST",
			contentType: "application/json",
			data: JSON.stringify(datos),
			success: (respuesta) => {
				if (respuesta.success) {
					cargarSucursales();

					Swal.fire({
						icon: "success",
						title: "¡Éxito!",
						text: respuesta.message || "Sucursal creada correctamente",
						confirmButtonText: "Aceptar",
					}).then(() => {
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
	// ALERTA SWEETALERT2 PARA EDITAR
	// ========================================

	function abrirFormularioEditar(sucursal) {
		const htmlFormulario = `
			<div class="space-y-4">
				<div>
					<label for="swal-nombre" class="block text-sm font-medium text-gray-700 mb-1 text-left">Nombre *</label>
					<input type="text" id="swal-nombre" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" value="${escapeHtml(sucursal.nombre || "")}" placeholder="Nombre de la sucursal">
				</div>
				<div>
					<label for="swal-direccion" class="block text-sm font-medium text-gray-700 mb-1 text-left">Dirección</label>
					<input type="text" id="swal-direccion" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" value="${escapeHtml(sucursal.direccion || "")}" placeholder="Dirección de la sucursal">
				</div>
				<div>
					<label for="swal-telefono" class="block text-sm font-medium text-gray-700 mb-1 text-left">Teléfono</label>
					<input type="text" id="swal-telefono" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" value="${escapeHtml(sucursal.telefono || "")}" placeholder="Solo números (8-15 dígitos)">
				</div>
				<div>
					<label for="swal-email" class="block text-sm font-medium text-gray-700 mb-1 text-left">Email</label>
					<input type="email" id="swal-email" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" value="${escapeHtml(sucursal.email || "")}" placeholder="email@ejemplo.com">
				</div>
				<div class="flex items-center gap-2">
					<input type="checkbox" id="swal-activa" class="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500" ${sucursal.activa ? "checked" : ""}>
					<label for="swal-activa" class="text-sm font-medium text-gray-700">Sucursal activa</label>
				</div>
			</div>
		`;

		Swal.fire({
			title: "Editar Sucursal",
			html: htmlFormulario,
			showCancelButton: true,
			confirmButtonText: "Guardar Cambios",
			cancelButtonText: "Cancelar",
			confirmButtonColor: "#16a34a",
			cancelButtonColor: "#6b7280",
			width: "500px",
			customClass: {
				confirmButton:
					"bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors",
				cancelButton:
					"bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors",
			},
			preConfirm: () => {
				const nombre = $("#swal-nombre").val().trim();
				const telefono = $("#swal-telefono").val().trim();
				const email = $("#swal-email").val().trim();

				if (!nombre) {
					Swal.showValidationMessage("El nombre es obligatorio");
					return false;
				}

				if (telefono && !/^[0-9]{8,15}$/.test(telefono)) {
					Swal.showValidationMessage(
						"El teléfono debe contener solo números (8-15 dígitos)",
					);
					return false;
				}

				if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
					Swal.showValidationMessage("El email no tiene un formato válido");
					return false;
				}

				return {
					nombre: nombre,
					direccion: $("#swal-direccion").val().trim() || null,
					telefono: telefono || null,
					email: email || null,
					activa: $("#swal-activa").is(":checked"),
				};
			},
		}).then((result) => {
			if (result.isConfirmed && result.value) {
				enviarEdicion(sucursal.id, result.value);
			}
		});
	}

	function enviarEdicion(id, datos) {
		$.ajax({
			url: API_BASE + "?accion=actualizar_sucursal&id=" + id,
			type: "PUT",
			contentType: "application/json",
			data: JSON.stringify(datos),
			success: (respuesta) => {
				if (respuesta.success) {
					cargarSucursales();

					Swal.fire({
						icon: "success",
						title: "¡Éxito!",
						text: respuesta.message || "Sucursal actualizada correctamente",
						confirmButtonText: "Aceptar",
					});
				} else {
					Swal.fire({
						icon: "error",
						title: "Error",
						text: respuesta.error || "No se pudo actualizar la sucursal",
						confirmButtonText: "Aceptar",
					});
				}
			},
			error: (xhr) => {
				let mensaje = "Error de conexión";

				if (xhr.responseJSON && xhr.responseJSON.error) {
					mensaje = xhr.responseJSON.error;
				} else if (xhr.status === 404) {
					mensaje = "La sucursal no fue encontrada";
				} else if (xhr.status === 409) {
					mensaje = "Ya existe otra sucursal con ese nombre";
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
		$tabla.html(`
            <tr>
                <td colspan="8" class="py-6 text-center text-gray-500">
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
			error: () => {
				$tabla.html(`
                    <tr>
                        <td colspan="8" class="py-6 text-center text-red-500">
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
				$searchInput.closest(".relative").removeClass("searching");
			},
		});
	}

	function renderizarSucursales(sucursales) {
		if (!sucursales || sucursales.length === 0) {
			$tabla.html(`
                <tr>
                    <td colspan="8" class="py-6 text-center text-gray-500">
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
                <tr class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" data-id="${sucursal.id}">
                    <td class="py-3 px-4">${sucursal.id}</td>
                    <td class="py-3 px-4 font-medium">${escapeHtml(sucursal.nombre)}</td>
                    <td class="py-3 px-4">${sucursal.direccion ? escapeHtml(sucursal.direccion) : '<span class="text-gray-400">—</span>'}</td>
                    <td class="py-3 px-4">${sucursal.telefono ? escapeHtml(sucursal.telefono) : '<span class="text-gray-400">—</span>'}</td>
                    <td class="py-3 px-4">${sucursal.email ? escapeHtml(sucursal.email) : '<span class="text-gray-400">—</span>'}</td>
                    <td class="py-3 px-4">${estadoBadge}</td>
                    <td class="py-3 px-4">${fechaCreacion}</td>
                    <td class="py-3 px-4 text-center">
                        <button type="button" class="btn-editar p-2 hover:bg-green-100 rounded-lg transition-colors" title="Editar sucursal" data-id="${sucursal.id}">
                            <i data-lucide="pencil" class="w-4 h-4 text-green-600"></i>
                        </button>
                    </td>
                </tr>
            `;
		});

		$tabla.html(html);
		lucide.createIcons();
	}

	// Delegated click para botones de editar
	$tabla.on("click", ".btn-editar", function () {
		const id = $(this).data("id");
		const row = $tabla.find(`tr[data-id="${id}"]`);
		const sucursal = {
			id: id,
			nombre: row.find("td").eq(1).text(),
			direccion:
				row.find("td").eq(2).find("span.text-gray-400").length > 0
					? ""
					: row.find("td").eq(2).text().trim(),
			telefono:
				row.find("td").eq(3).find("span.text-gray-400").length > 0
					? ""
					: row.find("td").eq(3).text().trim(),
			email:
				row.find("td").eq(4).find("span.text-gray-400").length > 0
					? ""
					: row.find("td").eq(4).text().trim(),
			activa: row.find("td").eq(5).find("span").hasClass("bg-green-100"),
		};
		abrirFormularioEditar(sucursal);
	});

	function renderizarPaginacion(pagination) {
		if (!pagination) return;

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

		lucide.createIcons();
	}

	// ========================================
	// EVENTOS DE CONTROLES
	// ========================================

	$searchInput.on("input", () => {
		clearTimeout(debounceTimer);
		$searchInput.closest(".relative").addClass("searching");

		debounceTimer = setTimeout(() => {
			estado.search = $searchInput.val().trim();
			estado.page = 1;
			cargarSucursales();
		}, 400);
	});

	$estadoFilter.on("change", () => {
		estado.estado = $estadoFilter.val();
		estado.page = 1;
		cargarSucursales();
	});

	$tabla
		.closest(".overflow-x-auto")
		.find("th.sortable")
		.on("click", function () {
			const $th = $(this);
			const column = $th.data("sort");

			if (!column) return;

			if (estado.sort === column) {
				estado.order = estado.order === "ASC" ? "DESC" : "ASC";
			} else {
				estado.sort = column;
				estado.order = "ASC";
			}

			estado.page = 1;
			cargarSucursales();
		});

	$paginas.on("click", "button[data-page]", function () {
		const newPage = parseInt($(this).data("page"));
		if (!isNaN(newPage) && newPage > 0) {
			estado.page = newPage;
			cargarSucursales();
		}
	});

	function actualizarIndicadorOrden() {
		$("th.sortable").removeClass("asc desc");
		$(`th.sortable[data-sort="${estado.sort}"]`).addClass(
			estado.order.toLowerCase(),
		);

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
