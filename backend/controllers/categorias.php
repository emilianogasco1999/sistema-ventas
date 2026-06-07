<?php
/**
 * Controlador de Categorías - Lógica de negocio y validación
 */

require_once __DIR__ . '/../models/categoria.php';

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
 * Controlador para crear una categoría
 */
function ctrlCrearCategoria() {
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
            'error' => 'Debe ingresar un nombre para la categoría.'
        ]);
        exit;
    }

    // Validación: Longitud (mínimo 3, máximo 100 por consistencia con la DB)
    if (mb_strlen($nombre) < 3 || mb_strlen($nombre) > 100) {
        echo json_encode([
            'success' => false,
            'error' => 'El nombre debe tener entre 3 y 100 caracteres.'
        ]);
        exit;
    }

    // Validación: Unicidad (insensible a mayúsculas/minúsculas)
    $categoriaExistente = dbBuscarCategoriaPorNombre($nombre);
    if ($categoriaExistente) {
        echo json_encode([
            'success' => false,
            'error' => 'Ya existe una categoría con ese nombre.'
        ]);
        exit;
    }

    // Guardar la categoría
    $exito = dbInsertarCategoria($nombre);

    if ($exito) {
        echo json_encode([
            'success' => true,
            'message' => 'Categoría creada correctamente.'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'error' => 'No se pudo guardar la categoría en la base de datos.'
        ]);
    }
    exit;
}

/**
 * Controlador para listar las categorías
 */
function ctrlListarCategorias() {
    verificarAdminAutenticado();

    $params = [
        'page' => isset($_GET['page']) ? (int)$_GET['page'] : null,
        'per_page' => isset($_GET['per_page']) ? (int)$_GET['per_page'] : 8,
        'paginar' => isset($_GET['page'])
    ];

    if ($params['paginar']) {
        $resultado = dbListarCategoriasPaginado($params);
        echo json_encode([
            'success' => true,
            'categorias' => $resultado['data'],
            'pagination' => [
                'total' => $resultado['total'],
                'page' => $resultado['page'],
                'per_page' => $resultado['per_page'],
                'total_pages' => $resultado['total_pages']
            ]
        ]);
    } else {
        $categorias = dbListarCategorias();
        echo json_encode([
            'success' => true,
            'categorias' => $categorias
        ]);
    }
    exit;
}

/**
 * Controlador para actualizar una categoría
 */
function ctrlActualizarCategoria() {
    verificarAdminAutenticado();

    // Leer datos del request
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        $input = $_POST;
    }

    $id = isset($input['id']) ? intval($input['id']) : 0;
    $nombre = trim($input['nombre'] ?? '');

    // Validación: ID válido
    if ($id <= 0) {
        echo json_encode([
            'success' => false,
            'error' => 'ID de categoría no válido.'
        ]);
        exit;
    }

    // Verificar si la categoría existe
    $categoriaActual = dbBuscarCategoriaPorId($id);
    if (!$categoriaActual) {
        echo json_encode([
            'success' => false,
            'error' => 'La categoría no existe.'
        ]);
        exit;
    }

    // Validación: Obligatorio
    if (empty($nombre)) {
        echo json_encode([
            'success' => false,
            'error' => 'Debe ingresar un nombre para la categoría.'
        ]);
        exit;
    }

    // Validación: Longitud (mínimo 3, máximo 100 por consistencia con la DB)
    if (mb_strlen($nombre) < 3 || mb_strlen($nombre) > 100) {
        echo json_encode([
            'success' => false,
            'error' => 'El nombre debe tener entre 3 y 100 caracteres.'
        ]);
        exit;
    }

    // Validación: Unicidad (insensible a mayúsculas/minúsculas, exceptuando el ID actual)
    $categoriaExistente = dbBuscarCategoriaPorNombreExceptoId($nombre, $id);
    if ($categoriaExistente) {
        echo json_encode([
            'success' => false,
            'error' => 'Ya existe una categoría con ese nombre.'
        ]);
        exit;
    }

    // Guardar cambios
    $exito = dbActualizarCategoria($id, $nombre);

    if ($exito) {
        echo json_encode([
            'success' => true,
            'message' => 'Categoría actualizada correctamente.'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'error' => 'No se pudieron guardar los cambios en la base de datos.'
        ]);
    }
    exit;
}

