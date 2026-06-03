/**
 * Dark Mode Toggle - v2
 *
 * Solo maneja la lógica de toggle y persistencia.
 * El botón ya está renderizado en PHP/HTML.
 */

(() => {
	const STORAGE_KEY = "darkMode";
	const COOKIE_KEY = "darkMode";

	// Verificar estado inicial desde cookie o localStorage
	function getInitialState() {
		// Primero verificar cookie
		const cookieValue = document.cookie
			.split("; ")
			.find((row) => row.startsWith(COOKIE_KEY + "="));

		if (cookieValue) {
			return cookieValue.split("=")[1] === "1";
		}

		// Luego localStorage
		if (localStorage.getItem(STORAGE_KEY)) {
			return localStorage.getItem(STORAGE_KEY) === "true";
		}

		// Por defecto, modo claro
		return false;
	}

	// Aplicar estado oscuro
	function applyDarkMode(isDark) {
		if (isDark) {
			document.body.classList.add("dark");
		} else {
			document.body.classList.remove("dark");
		}

		// Guardar en cookie (30 días)
		document.cookie =
			COOKIE_KEY +
			"=" +
			(isDark ? "1" : "0") +
			"; max-age=" +
			60 * 60 * 24 * 30 +
			"; path=/";

		// Guardar en localStorage
		localStorage.setItem(STORAGE_KEY, isDark);

		// Actualizar iconos
		updateIcons(isDark);
	}

	// Actualizar iconos sol/luna
	function updateIcons(isDark) {
		const sunIcon = document.querySelector(".icon-sun");
		const moonIcon = document.querySelector(".icon-moon");

		if (sunIcon) {
			sunIcon.style.display = isDark ? "block" : "none";
		}
		if (moonIcon) {
			moonIcon.style.display = isDark ? "none" : "block";
		}
	}

	// Inicializar
	function initDarkMode() {
		const isDark = getInitialState();
		const button = document.getElementById("btnDarkMode");

		if (!button) return;

		// Aplicar estado inicial sin animación
		applyDarkMode(isDark);

		// Event listener para toggle
		button.addEventListener("click", () => {
			const newState = !document.body.classList.contains("dark");
			applyDarkMode(newState);
		});
	}

	// Cuando el DOM esté listo
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", initDarkMode);
	} else {
		initDarkMode();
	}
})();
