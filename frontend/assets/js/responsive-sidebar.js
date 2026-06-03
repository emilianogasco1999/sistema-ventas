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

// Inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", initResponsiveSidebar);
