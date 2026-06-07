<?php
/**
 * Controlador de Métodos de Pago - Lógica de negocio y validación
 */

require_once __DIR__ . '/../models/metodo_pago.php';

/**
 * Verifica si el usuario actual es un administrador autenticado
 */
function verificarAdminAutenticado() {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true || ($_SESSION['usuario_rol'] !== 'Administrador' && $_SESSION['usuario_rol'] !== 'Super Admin')) {
        echo json_encode([
            'success' => false,
            'error' => 'Acceso denegado. Se requieren permisos de Administrador.'
        ]);
        exit;
    }
}

/**
 * Controlador para crear un método de pago
 */
function ctrlCrearMetodoPago() {
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
            'error' => 'Debe ingresar un nombre para el método de pago.'
        ]);
        exit;
    }

    // Validación: Longitud (mínimo 3, máximo 50 por consistencia con la DB)
    if (mb_strlen($nombre) < 3 || mb_strlen($nombre) > 50) {
        echo json_encode([
            'success' => false,
            'error' => 'El nombre debe tener entre 3 y 50 caracteres.'
        ]);
        exit;
    }

    // Validación: Unicidad (insensible a mayúsculas/minúsculas)
    $metodoExistente = dbBuscarMetodoPagoPorNombre($nombre);
    if ($metodoExistente) {
        echo json_encode([
            'success' => false,
            'error' => 'Ya existe un método de pago con ese nombre.'
        ]);
        exit;
    }

    // Guardar el método de pago
    $exito = dbInsertarMetodoPago($nombre);

    if ($exito) {
        echo json_encode([
            'success' => true,
            'message' => 'Método de pago creado correctamente.'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'error' => 'No se pudo guardar el método de pago en la base de datos.'
        ]);
    }
    exit;
}/**
 * Controlador para listar los métodos de pago (con soporte opcional de paginación)
 */
function ctrlListarMetodosPago() {
    verificarAdminAutenticado();

    $params = [
        'page' => isset($_GET['page']) ? (int)$_GET['page'] : null,
        'per_page' => isset($_GET['per_page']) ? (int)$_GET['per_page'] : 8,
        'paginar' => isset($_GET['page'])
    ];

    if ($params['paginar']) {
        $resultado = dbListarMetodosPagoPaginado($params);
        echo json_encode([
            'success' => true,
            'metodos' => $resultado['data'],
            'pagination' => [
                'total' => $resultado['total'],
                'page' => $resultado['page'],
                'per_page' => $resultado['per_page'],
                'total_pages' => $resultado['total_pages']
            ]
        ]);
    } else {
        $metodos = dbListarMetodosPago();
        echo json_encode([
            'success' => true,
            'metodos' => $metodos
        ]);
    }
    exit;
}

/**
 * Controlador para actualizar un método de pago
 */
function ctrlActualizarMetodoPago() {
    verificarAdminAutenticado();

    // Leer datos del request
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        $input = $_POST;
    }

    $id = isset($input['id']) ? (int)$input['id'] : 0;
    $nombre = trim($input['nombre'] ?? '');

    // Validación: ID
    if ($id <= 0) {
        echo json_encode([
            'success' => false,
            'error' => 'El método de pago seleccionado no existe.'
        ]);
        exit;
    }

    // Verificar si existe el método de pago
    $metodo = dbBuscarMetodoPagoPorId($id);
    if (!$metodo) {
        echo json_encode([
            'success' => false,
            'error' => 'El método de pago seleccionado no existe.'
        ]);
        exit;
    }

    // Validación: Obligatorio
    if (empty($nombre)) {
        echo json_encode([
            'success' => false,
            'error' => 'Debe ingresar un nombre para el método de pago.'
        ]);
        exit;
    }

    // Validación: Longitud (mínimo 3, máximo 50)
    if (mb_strlen($nombre) < 3 || mb_strlen($nombre) > 50) {
        echo json_encode([
            'success' => false,
            'error' => 'El nombre debe tener entre 3 y 50 caracteres.'
        ]);
        exit;
    }

    // Validación: Unicidad (excepto el propio ID)
    $metodoExistente = dbBuscarMetodoPagoPorNombreExceptoId($nombre, $id);
    if ($metodoExistente) {
        echo json_encode([
            'success' => false,
            'error' => 'Ya existe un método de pago con ese nombre.'
        ]);
        exit;
    }

    // Actualizar en la base de datos
    $exito = dbActualizarMetodoPago($id, $nombre);

    if ($exito) {
        echo json_encode([
            'success' => true,
            'message' => 'Método de pago actualizado correctamente.'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'error' => 'No se pudo actualizar el método de pago en la base de datos o no se realizaron cambios.'
        ]);
    }
    exit;
}

