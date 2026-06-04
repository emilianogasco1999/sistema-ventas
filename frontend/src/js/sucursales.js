/**
 * Gestión de Sucursales - JavaScript
 *
 * Maneja la creación y listado de sucursales via API.
 */

$(document).ready(() => {
	// Inicializar componentes Lucide
	if (typeof lucide !== "undefined") {
		lucide.createIcons();
	}

	// Elementos del DOM
	const $form = $("#formSucursal");
	const $tabla = $("#tablaSucursales");

	// API base
	const API_BASE = "../../../../backend/api.php";

	let formValidator = null;

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
	// ENVÍO A LA API
	// ========================================

	function enviarFormulario(datos) {
		$.ajax({
			url: API_BASE + "?accion=crear_sucursal",
			type: "POST",
			contentType: "application/json",
			data: JSON.stringify(datos),
			success: (respuesta) => {
				if (respuesta.success) {
					// Recargar listado inmediatamente para reflejar cambios en segundo plano
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
	// LISTADO DE SUCURSALES
	// ========================================

	function cargarSucursales() {
		$.ajax({
			url: API_BASE,
			type: "GET",
			data: { accion: "listar_sucursales" },
			success: (respuesta) => {
				if (respuesta.success && respuesta.data) {
					renderizarSucursales(respuesta.data);
				}
			},
			error: () => {
				$tabla.html(`
                    <tr>
                        <td colspan="6" class="py-6 text-center text-red-500">
                            <div class="flex flex-col items-center gap-2">
                                <i data-lucide="alert-circle" class="w-6 h-6"></i>
                                Error al cargar las sucursales
                            </div>
                        </td>
                    </tr>
                `);
				lucide.createIcons();
			},
		});
	}

	function renderizarSucursales(sucursales) {
		if (!sucursales || sucursales.length === 0) {
			$tabla.html(`
                <tr>
                    <td colspan="6" class="py-6 text-center text-gray-500">
                        <div class="flex flex-col items-center gap-2">
                            <i data-lucide="package-x" class="w-6 h-6"></i>
                            No hay sucursales registradas
                        </div>
                    </td>
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
                    <td class="py-3 px-4 font-medium">${escapeHtml(sucursal.nombre)}</td>
                    <td class="py-3 px-4">${sucursal.direccion || '<span class="text-gray-400">—</span>'}</td>
                    <td class="py-3 px-4">${sucursal.telefono || '<span class="text-gray-400">—</span>'}</td>
                    <td class="py-3 px-4">${sucursal.email || '<span class="text-gray-400">—</span>'}</td>
                    <td class="py-3 px-4">${estadoBadge}</td>
                    <td class="py-3 px-4">${fechaCreacion}</td>
                </tr>
            `;
		});

		$tabla.html(html);
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
