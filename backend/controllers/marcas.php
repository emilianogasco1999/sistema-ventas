<?php
/**
 * Controlador de Marcas - Lógica de negocio y validación
 */

require_once __DIR__ . '/../models/marca.php';

/**
 * Verifica si el usuario tiene permisos para gestionar marcas (Administrador, Super Admin o Encargado)
 */
function verificarPermisoMarcas() {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
        echo json_encode([
            'success' => false,
            'error' => 'Acceso denegado. Debe iniciar sesión.'
        ]);
        exit;
    }

    $rol = $_SESSION['usuario_rol'] ?? '';
    if ($rol !== 'Administrador' && $rol !== 'Super Admin' && $rol !== 'Encargado') {
        echo json_encode([
            'success' => false,
            'error' => 'Acceso denegado. No tiene permisos para realizar esta acción.'
        ]);
        exit;
    }
}

/**
 * Controlador para crear una marca
 */
function ctrlCrearMarca() {
    verificarPermisoMarcas();

    // Leer datos del request
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        $input = $_POST;
    }

    $nombre = trim($input['nombre'] ?? '');

    // Validación: Obligatorio (RN-01, RN-04)
    if (empty($nombre)) {
        echo json_encode([
            'success' => false,
            'error' => 'El nombre de la marca es obligatorio.'
        ]);
        exit;
    }

    // Validación: Longitud máxima 100 caracteres
    if (mb_strlen($nombre) > 100) {
        echo json_encode([
            'success' => false,
            'error' => 'El nombre de la marca no puede superar los 100 caracteres.'
        ]);
        exit;
    }

    // Validación: Longitud mínima (coherencia)
    if (mb_strlen($nombre) < 2) {
        echo json_encode([
            'success' => false,
            'error' => 'El nombre de la marca debe tener al menos 2 caracteres.'
        ]);
        exit;
    }

    // Validación: Unicidad (RN-02)
    $marcaExistente = dbBuscarMarcaPorNombre($nombre);
    if ($marcaExistente) {
        echo json_encode([
            'success' => false,
            'error' => 'Ya existe una marca con ese nombre.'
        ]);
        exit;
    }

    // Crear la marca
    $exito = dbInsertarMarca($nombre);

    if ($exito) {
        echo json_encode([
            'success' => true,
            'message' => 'Marca creada exitosamente.',
            'nombre' => $nombre
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'error' => 'No se pudo guardar la marca en la base de datos.'
        ]);
    }
    exit;
}

/**
 * Controlador para listar las marcas
 */
function ctrlListarMarcas() {
    verificarPermisoMarcas();

    $marcas = dbListarMarcas();

    echo json_encode([
        'success' => true,
        'marcas' => $marcas
    ]);
    exit;
}
