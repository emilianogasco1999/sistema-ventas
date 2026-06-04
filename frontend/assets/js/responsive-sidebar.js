/**
 * Responsive Sidebar Toggle
 *
 * Controla el menú hamburguesa en pantallas pequeñas.
 * Se inicializa automáticamente con initResponsiveSidebar().
 */

function initResponsiveSidebar() {
	const menuToggle = document.querySelector(".menu-toggle-btn");
	const sidebar = document.querySelector(".sidebar-container");
	const overlay = document.querySelector(".sidebar-overlay");

	if (!menuToggle || !sidebar) {
		return;
	}

	// Abrir sidebar
	function openSidebar() {
		sidebar.classList.add("open");
		if (overlay) overlay.classList.add("active");
		document.body.style.overflow = "hidden";
	}

	// Cerrar sidebar
	function closeSidebar() {
		sidebar.classList.remove("open");
		if (overlay) overlay.classList.remove("active");
		document.body.style.overflow = "";
	}

	// Toggle
	function toggleSidebar() {
		if (sidebar.classList.contains("open")) {
			closeSidebar();
		} else {
			openSidebar();
		}
	}

	// Event listeners
	if (menuToggle) {
		menuToggle.addEventListener("click", toggleSidebar);
	}

	if (overlay) {
		overlay.addEventListener("click", closeSidebar);
	}

	// Cerrar con Escape
	document.addEventListener("keydown", (e) => {
		if (e.key === "Escape" && sidebar.classList.contains("open")) {
			closeSidebar();
		}
	});

	// Cerrar sidebar al hacer click en un link (en móvil)
	sidebar.querySelectorAll("a").forEach((link) => {
		link.addEventListener("click", () => {
			if (window.innerWidth < 1024) {
				closeSidebar();
			}
		});
	});
}

/**
 * Inicializa el manejador global para el botón de Cerrar Sesión
 */
function initGlobalLogout() {
	const btnLogout = document.getElementById("btnLogout");
	if (!btnLogout) return;

	btnLogout.addEventListener("click", (e) => {
		e.preventDefault();

		// Determinar si estamos en una página de configuración para ajustar rutas relativas
		const isConfigPage = window.location.pathname.includes('/config/');
		const apiPath = isConfigPage ? '../../../../backend/api.php?accion=logout' : '../../../backend/api.php?accion=logout';
		const loginPath = isConfigPage ? '../login.php' : 'login.php';

		if (typeof Swal !== "undefined") {
			const isDark = document.body.classList.contains("dark");
			Swal.fire({
				title: "¿Cerrar sesión?",
				icon: "question",
				showCancelButton: true,
				confirmButtonColor: "#dc2626",
				cancelButtonColor: "#6b7280",
				confirmButtonText: "Sí, cerrar",
				cancelButtonText: "Cancelar",
				background: isDark ? "#1f2937" : "#ffffff",
				color: isDark ? "#f3f4f6" : "#1f2937",
			}).then((result) => {
				if (result.isConfirmed) {
					ejecutarLogout(apiPath, loginPath);
				}
			});
		} else {
			if (confirm("¿Estás seguro de que querés cerrar sesión?")) {
				ejecutarLogout(apiPath, loginPath);
			}
		}
	});
}

function ejecutarLogout(apiPath, loginPath) {
	// Usar fetch para no depender de jQuery si no está disponible
	fetch(apiPath, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		}
	})
	.then(response => response.json())
	.then(data => {
		if (data.success) {
			window.location.href = loginPath;
		} else {
			alert(data.error || "Ocurrió un error al cerrar sesión.");
		}
	})
	.catch(() => {
		alert("Error de red al intentar cerrar sesión.");
	});
}

// Inicializar componentes cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
	initResponsiveSidebar();
	initGlobalLogout();
});
