/**
 * Dashboard Page Logic - Forrajería
 *
 * Maneja toda la lógica de la página del dashboard.
 */

$(document).ready(() => {
	// Debug
	console.log("Dashboard JS loaded");
	console.log("jQuery version:", $.fn.jquery);
	console.log("SweetAlert2:", typeof Swal);
	console.log("btnLogout exists:", $("#btnLogout").length);

	// Inicializar Lucide (iconos)
	if (typeof lucide !== "undefined") {
		lucide.createIcons();
	}

	// Dark mode toggle se inicializa automáticamente en dark-mode-toggle.js

	// Verificar sesión
	verificarSesion();
	// Cargar stats del dashboard
	cargarDashboardStats();
});

/**
 * Verifica si el usuario está autenticado
 */
function verificarSesion() {
	$.get("../../../backend/api.php?accion=verificar_sesion")
		.done(handleSesionVerificada)
		.fail(handleSesionFallida);
}

/**
 * Callback cuando la sesión está verificada
 */
function handleSesionVerificada(response) {
	if (response.success && response.authenticated) {
		$("#userName").text(response.user.nombre);
		$("#userRol").text(response.user.rol);
	} else {
		redireccionarALogin();
	}
}

/**
 * Callback cuando falla la verificación de sesión
 */
function handleSesionFallida() {
	redireccionarALogin();
}

/**
 * Redirige al usuario al login
 */
function redireccionarALogin() {
	window.location.href = "login.php";
}

/**
 * Carga las estadísticas del dashboard
 */
function cargarDashboardStats() {
	$.get("../../../backend/api.php?accion=dashboard_stats")
		.done(handleStatsCargados)
		.fail(handleStatsFallidos);
}

/**
 * Callback cuando las stats se cargaron exitosamente
 */
function handleStatsCargados(response) {
	if (response.success) {
		const stats = response.stats;

		$("#statVentas").text(stats.ventas_hoy);
		$("#statMonto").text(formatearMoneda(stats.monto_ventas_hoy));
		$("#statProductos").text(stats.total_productos);
		$("#statStockBajo").text(stats.stock_bajo);

		// Re-inicializar íconos
		lucide.createIcons();
	}
}

/**
 * Callback cuando falla la carga de stats
 */
function handleStatsFallidos() {
	// Mostrar valores por defecto
	$("#statVentas").text("0");
	$("#statMonto").text("$0.00");
	$("#statProductos").text("0");
	$("#statStockBajo").text("0");
}

/**
 * Formatea un número como moneda Argentina
 */
function formatearMoneda(monto) {
	return (
		"$" +
		Number(monto).toLocaleString("es-AR", {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		})
	);
}


