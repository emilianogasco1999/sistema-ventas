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

    $params = [
        'search' => $_GET['search'] ?? '',
        'sort' => $_GET['sort'] ?? 'nombre',
        'order' => $_GET['order'] ?? 'ASC',
        'page' => isset($_GET['page']) ? (int)$_GET['page'] : null,
        'per_page' => isset($_GET['per_page']) ? (int)$_GET['per_page'] : null,
        'paginar' => isset($_GET['page']) // Si se pasa 'page', paginamos por defecto
    ];

    $resultado = dbListarMarcasPaginado($params);

    echo json_encode([
        'success' => true,
        'marcas' => $resultado['data'],
        'data' => $resultado['data'], // Consistencia con listados genéricos de la app
        'pagination' => [
            'total' => $resultado['total'],
            'page' => $resultado['page'],
            'per_page' => $resultado['per_page'],
            'total_pages' => $resultado['total_pages']
        ]
    ]);
    exit;
}

/**
 * Controlador para obtener una marca por su ID
 */
function ctrlObtenerMarca() {
    verificarPermisoMarcas();

    $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

    if ($id <= 0) {
        echo json_encode([
            'success' => false,
            'error' => 'El ID de la marca no es válido.'
        ]);
        exit;
    }

    $marca = dbBuscarMarcaPorId($id);

    if (!$marca) {
        echo json_encode([
            'success' => false,
            'error' => 'La marca no existe.'
        ]);
        exit;
    }

    echo json_encode([
        'success' => true,
        'marca' => $marca
    ]);
    exit;
}

/**
 * Controlador para actualizar una marca
 */
function ctrlActualizarMarca() {
    verificarPermisoMarcas();

    // Leer datos del request
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        $input = $_POST;
    }

    $id = isset($input['id']) ? (int)$input['id'] : 0;
    $nombre = trim($input['nombre'] ?? '');

    // Validación: ID de la marca
    if ($id <= 0) {
        echo json_encode([
            'success' => false,
            'error' => 'El ID de la marca no es válido.'
        ]);
        exit;
    }

    // Validación: Obligatorio
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

    // Validación: Longitud mínima
    if (mb_strlen($nombre) < 2) {
        echo json_encode([
            'success' => false,
            'error' => 'El nombre de la marca debe tener al menos 2 caracteres.'
        ]);
        exit;
    }

    // Verificar si existe la marca
    $marca = dbBuscarMarcaPorId($id);
    if (!$marca) {
        echo json_encode([
            'success' => false,
            'error' => 'La marca no existe.'
        ]);
        exit;
    }

    // Validación: Unicidad exceptuando el propio registro (RN-03)
    $marcaExistente = dbBuscarMarcaPorNombreExceptoId($nombre, $id);
    if ($marcaExistente) {
        echo json_encode([
            'success' => false,
            'error' => 'Ya existe una marca con ese nombre.'
        ]);
        exit;
    }

    // Actualizar la marca
    $exito = dbActualizarMarca($id, $nombre);

    if ($exito) {
        echo json_encode([
            'success' => true,
            'message' => 'Marca actualizada correctamente.',
            'nombre' => $nombre
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'error' => 'No se pudo actualizar la marca en la base de datos o no se realizaron cambios.'
        ]);
    }
    exit;
}

/**
 * Controlador para eliminar una marca físicamente
 */
function ctrlEliminarMarca() {
    verificarPermisoMarcas();

    // Leer el ID de la marca desde la query string o del cuerpo JSON
    $input = json_decode(file_get_contents('php://input'), true);
    $id = isset($_GET['id']) ? (int)$_GET['id'] : (isset($input['id']) ? (int)$input['id'] : 0);

    // Validación de ID (RN-01)
    if ($id <= 0) {
        http_response_code(404);
        echo json_encode([
            'message' => 'La marca no existe.'
        ]);
        exit;
    }

    // Verificar si la marca existe (RN-01)
    $marca = dbBuscarMarcaPorId($id);
    if (!$marca) {
        http_response_code(404);
        echo json_encode([
            'message' => 'La marca no existe.'
        ]);
        exit;
    }

    // Verificar si tiene productos asociados (RN-02 y RN-03)
    $cantProductos = dbContarProductosPorMarca($id);
    if ($cantProductos > 0) {
        http_response_code(409);
        echo json_encode([
            'message' => 'No se puede eliminar la marca porque tiene productos asociados.'
        ]);
        exit;
    }

    // Eliminar físicamente (RN-04)
    $exito = dbEliminarMarca($id);

    if ($exito) {
        http_response_code(200);
        echo json_encode([
            'message' => 'Marca eliminada correctamente.'
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'message' => 'No se pudo eliminar la marca de la base de datos.'
        ]);
    }
    exit;
}

