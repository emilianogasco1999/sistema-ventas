<?php
/**
 * Controlador de Roles - Lógica de negocio y validación
 */

require_once __DIR__ . '/../models/rol.php';

/**
 * Verifica si el usuario actual es un administrador autenticado
 */
function verificarAdminAutenticado() {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true || $_SESSION['usuario_rol'] !== 'Administrador') {
        echo json_encode([
            'success' => false,
            'error' => 'Acceso denegado. Se requieren permisos de Administrador.'
        ]);
        exit;
    }
}

/**
 * Controlador para crear un rol
 */
function ctrlCrearRol() {
    verificarAdminAutenticado();

    // Leer datos del request
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        $input = $_POST;
    }

    $nombre = trim($input['nombre'] ?? '');

    // Validación: Obligatorio
    if (empty($nombre)) {
        echo json_encode([
            'success' => false,
            'error' => 'El nombre del rol es requerido.'
        ]);
        exit;
    }

    // Validación: Longitud
    if (mb_strlen($nombre) < 3 || mb_strlen($nombre) > 50) {
        echo json_encode([
            'success' => false,
            'error' => 'El nombre del rol debe tener entre 3 y 50 caracteres.'
        ]);
        exit;
    }

    // Validación: Formato alfanumérico, espacios, guiones medios y bajos
    if (!preg_match('/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ _-]+$/u', $nombre)) {
        echo json_encode([
            'success' => false,
            'error' => 'El nombre contiene caracteres no válidos. Solo se permiten letras, números, espacios, guiones y guiones bajos.'
        ]);
        exit;
    }

    // Validación: Unicidad (insensible a mayúsculas/minúsculas)
    $rolExistente = dbBuscarRolPorNombre($nombre);
    if ($rolExistente) {
        echo json_encode([
            'success' => false,
            'error' => 'El rol ya existe.'
        ]);
        exit;
    }

    // Crear el rol
    $usuarioCreadorId = $_SESSION['usuario_id'];
    $exito = dbInsertarRol($nombre, $usuarioCreadorId);

    if ($exito) {
        echo json_encode([
            'success' => true,
            'message' => 'Rol creado exitosamente.'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'error' => 'No se pudo guardar el rol en la base de datos.'
        ]);
    }
    exit;
}

/**
 * Controlador para listar los roles
 */
function ctrlListarRoles() {
    verificarAdminAutenticado();

    $roles = dbListarRoles();

    echo json_encode([
        'success' => true,
        'roles' => $roles
    ]);
    exit;
}
