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

/**
 * Controlador para editar un rol
 */
function ctrlEditarRol() {
    verificarAdminAutenticado();

    // Leer datos del request
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        $input = $_POST;
    }

    $id = isset($input['id']) ? (int)$input['id'] : 0;
    $nombre = trim($input['nombre'] ?? '');
    // Determinar el valor de activo
    $activo = isset($input['activo']) ? ($input['activo'] === true || $input['activo'] == 1 || $input['activo'] === 'true' || $input['activo'] === '1') : false;

    // Validación: ID
    if ($id <= 0) {
        echo json_encode([
            'success' => false,
            'error' => 'El ID del rol no es válido.'
        ]);
        exit;
    }

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

    // Salvaguardar rol Administrador (id = 1)
    if ($id === 1) {
        if ($nombre !== 'Administrador') {
            echo json_encode([
                'success' => false,
                'error' => 'No se puede cambiar el nombre del rol Administrador para asegurar el correcto funcionamiento del sistema.'
            ]);
            exit;
        }
        if (!$activo) {
            echo json_encode([
                'success' => false,
                'error' => 'No se puede desactivar el rol de Administrador.'
            ]);
            exit;
        }
    }

    // Validación: Unicidad (insensible a mayúsculas/minúsculas, excepto el ID actual)
    $rolExistente = dbBuscarRolPorNombreExceptoId($nombre, $id);
    if ($rolExistente) {
        echo json_encode([
            'success' => false,
            'error' => 'Ya existe otro rol con ese nombre.'
        ]);
        exit;
    }

    // Actualizar el rol
    $exito = dbActualizarRol($id, $nombre, $activo);

    if ($exito) {
        echo json_encode([
            'success' => true,
            'message' => 'Rol actualizado exitosamente.'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'error' => 'No se pudo actualizar el rol en la base de datos o no se realizaron cambios.'
        ]);
    }
    exit;
}

/**
 * Controlador para eliminar un rol (desactivación lógica)
 */
function ctrlEliminarRol() {
    verificarAdminAutenticado();

    // Leer datos del request (JSON o POST)
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        $input = $_POST;
    }
    
    $id = isset($input['id']) ? (int)$input['id'] : (isset($_GET['id']) ? (int)$_GET['id'] : 0);

    // Validación de ID
    if ($id <= 0) {
        echo json_encode([
            'success' => false,
            'error' => 'El ID del rol no es válido.'
        ]);
        exit;
    }

    // Escenario 3: Verificar que el rol exista
    $rol = dbBuscarRolPorId($id);
    if (!$rol) {
        echo json_encode([
            'success' => false,
            'error' => 'El rol no fue encontrado.'
        ]);
        exit;
    }

    // Impedir eliminar el Administrador principal por seguridad
    if ($id === 1) {
        echo json_encode([
            'success' => false,
            'error' => 'No es posible eliminar el rol de Administrador principal por razones de seguridad.'
        ]);
        exit;
    }

    // Escenario 2: Verificar si tiene usuarios asociados
    $cantUsuarios = dbContarUsuariosConRol($id);
    if ($cantUsuarios > 0) {
        echo json_encode([
            'success' => false,
            'error' => 'No es posible eliminar el rol porque tiene usuarios asociados.'
        ]);
        exit;
    }

    // Escenario 1: Eliminar (marcar activo = 0)
    $exito = dbEliminarRol($id);

    if ($exito) {
        echo json_encode([
            'success' => true,
            'message' => 'Rol eliminado exitosamente.'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'error' => 'No se pudo eliminar el rol.'
        ]);
    }
    exit;
}


