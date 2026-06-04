/**
 * Sidebar Logic - Forraiería
 *
 * Maneja la funcionalidad del sidebar: logout y responsive.
 * Este archivo se carga con el componente sidebar.php
 */

$(document).ready(() => {
	// Inicializar Lucide
	if (typeof lucide !== "undefined") {
		lucide.createIcons();
	}

	// Logout
	$("#btnLogout").on("click", () => {
		Swal.fire({
			title: "¿Cerrar sesión?",
			icon: "question",
			showCancelButton: true,
			confirmButtonColor: "#dc2626",
			cancelButtonColor: "#6b7280",
			confirmButtonText: "Sí, cerrar",
			cancelButtonText: "Cancelar",
		}).then((result) => {
			if (result.isConfirmed) {
				$.post("../../../backend/api.php?accion=logout", () => {
					window.location.href = "../login.php";
				});
			}
		});
	});
});
