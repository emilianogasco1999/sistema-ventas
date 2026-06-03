/**
 * Login Page Logic - Forrajería
 *
 * Maneja toda la lógica de la página de login.
 */

$(document).ready(() => {
	// Inicializar Lucide (iconos)
	lucide.createIcons();

	// Dark mode toggle se inicializa automáticamente en dark-mode-toggle.js

	// Inicializar validación del formulario
	initLoginValidation();
});

/**
 * Inicializa la validación del formulario de login
 */
function initLoginValidation() {
	const formValidator = new FormValidator("#loginForm", {
		validateOnBlur: true,
		validateOnInput: true,
		clearErrorsOnInput: true,
	});

	// Manejar submit del formulario
	$("#loginForm").on("submit", (e) => {
		e.preventDefault();
		handleLoginSubmit(formValidator);
	});
}

/**
 * Maneja el submit del formulario de login
 */
function handleLoginSubmit(formValidator) {
	// Validar primero
	if (!formValidator.validate()) {
		// Focus en el primer campo con error
		const firstError = $("#loginForm").find(".is-invalid").first();
		if (firstError.length) {
			firstError.focus();
		}
		return;
	}

	const $btn = $("#btnLogin");
	const $btnText = $("#btnLoginText");
	const $btnIcon = $("#btnLoginIcon");
	const $serverError = $("#serverError");

	// Deshabilitar botón y mostrar estado de carga
	$btn.prop("disabled", true);
	$btn
		.removeClass("bg-green-600 hover:bg-green-700")
		.addClass("bg-green-400 cursor-not-allowed");
	$btnText.text("Ingresando...");
	$btnIcon.removeAttr("data-lucide").html(getSpinnerSVG());

	// Ocultar error del servidor anterior
	$serverError.addClass("hidden");

	// Enviar datos al backend
	$.post("../../../backend/api.php?accion=login", {
		username: $("#username").val().trim(),
		password: $("#password").val(),
	})
		.done((response) => {
			if (response.success) {
				// Login exitoso - mostrar mensaje y redirigir
				Swal.fire({
					icon: "success",
					title: "¡Bienvenido!",
					text: "Redirigiendo al dashboard...",
					timer: 1500,
					showConfirmButton: false,
					willClose: () => {
						window.location.href = "../pages/dashboard.php";
					},
				});
			} else {
				// Mostrar error del servidor
				showServerError(response.error || "Credenciales incorrectas");
				resetLoginButton();
			}
		})
		.fail(() => {
			showServerError("Error de conexión. Intentá de nuevo.");
			resetLoginButton();
		});
}

/**
 * Muestra el mensaje de error del servidor
 */
function showServerError(message) {
	const $serverError = $("#serverError");
	const $btn = $("#btnLogin");
	const $btnText = $("#btnLoginText");
	const $btnIcon = $("#btnLoginIcon");

	$serverError.text(message).removeClass("hidden");

	// Restaurar botón
	$btn.prop("disabled", false);
	$btn
		.addClass("bg-green-600 hover:bg-green-700")
		.removeClass("bg-green-400 cursor-not-allowed");
	$btnText.text("Iniciar Sesión");
	$btnIcon
		.attr("data-lucide", "log-in")
		.html('<i data-lucide="log-in" class="w-5 h-5"></i>');
	lucide.createIcons();
}

/**
 * Restaura el botón a su estado original
 */
function resetLoginButton() {
	const $btn = $("#btnLogin");
	const $btnText = $("#btnLoginText");
	const $btnIcon = $("#btnLoginIcon");

	$btn.prop("disabled", false);
	$btn
		.addClass("bg-green-600 hover:bg-green-700")
		.removeClass("bg-green-400 cursor-not-allowed");
	$btnText.text("Iniciar Sesión");
	$btnIcon
		.attr("data-lucide", "log-in")
		.html('<i data-lucide="log-in" class="w-5 h-5"></i>');
	lucide.createIcons();
}

/**
 * Icono de loader (Lucide loader-circle)
 */
function getSpinnerSVG() {
	return '<i data-lucide="loader-circle" class="animate-spin w-5 h-5"></i>';
}
