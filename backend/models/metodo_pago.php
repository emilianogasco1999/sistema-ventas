<?php
/**
 * Modelo de Métodos de Pago - Consultas SQL puras
 */

require_once __DIR__ . '/../config/database.php';

/**
 * Busca un método de pago por su nombre (insensible a mayúsculas/minúsculas)
 * @param string $nombre
 * @return array|null
 */
function dbBuscarMetodoPagoPorNombre($nombre) {
    $db = obtenerConexion();
    $stmt = $db->prepare("SELECT * FROM metodos_pago WHERE LOWER(nombre) = LOWER(:nombre) LIMIT 1");
    $stmt->execute(['nombre' => $nombre]);
    return $stmt->fetch() ?: null;
}

/**
 * Inserta un nuevo método de pago en la base de datos
 * @param string $nombre
 * @return bool
 */
function dbInsertarMetodoPago($nombre) {
    $db = obtenerConexion();
    $stmt = $db->prepare("INSERT INTO metodos_pago (nombre) VALUES (:nombre)");
    return $stmt->execute(['nombre' => $nombre]);
}

/**
 * Obtiene el listado de todos los métodos de pago registrados
 * @return array
 */
function dbListarMetodosPago() {
    $db = obtenerConexion();
    $stmt = $db->query("SELECT * FROM metodos_pago ORDER BY nombre ASC");
    return $stmt->fetchAll();
}

/**
 * Obtiene el listado de métodos de pago con paginación
 * @param array $params Parámetros de paginación
 * @return array
 */
function dbListarMetodosPagoPaginado($params = []) {
    $db = obtenerConexion();
    
    $paginar = isset($params['paginar']) ? ($params['paginar'] === true || $params['paginar'] === 'true' || $params['paginar'] == 1) : true;
    
    $page = max(1, intval($params['page'] ?? 1));
    $perPage = min(100, max(1, intval($params['per_page'] ?? 8)));
    $offset = ($page - 1) * $perPage;
    
    $sort = 'nombre';
    $order = 'ASC';
    
    // Contar total
    $stmtCount = $db->query("SELECT COUNT(*) FROM metodos_pago");
    $total = (int)$stmtCount->fetchColumn();
    
    // Obtener datos
    $sql = "SELECT id, nombre FROM metodos_pago ORDER BY $sort $order";
    if ($paginar) {
        $sql .= " LIMIT :limit OFFSET :offset";
    }
    
    $stmt = $db->prepare($sql);
    if ($paginar) {
        $stmt->bindValue(':limit', $perPage, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    }
    
    $stmt->execute();
    $data = $stmt->fetchAll();
    
    $totalPages = $paginar && $total > 0 ? ceil($total / $perPage) : 1;
    
    return [
        'data' => $data,
        'total' => $total,
        'page' => $page,
        'per_page' => $perPage,
        'total_pages' => $totalPages
    ];
}

/**
 * Busca un método de pago por su ID
 * @param int $id
 * @return array|null
 */
function dbBuscarMetodoPagoPorId($id) {
    $db = obtenerConexion();
    $stmt = $db->prepare("SELECT * FROM metodos_pago WHERE id = :id LIMIT 1");
    $stmt->execute(['id' => $id]);
    return $stmt->fetch() ?: null;
}

/**
 * Busca un método de pago por su nombre excluyendo un ID específico
 * @param string $nombre
 * @param int $id
 * @return array|null
 */
function dbBuscarMetodoPagoPorNombreExceptoId($nombre, $id) {
    $db = obtenerConexion();
    $stmt = $db->prepare("SELECT * FROM metodos_pago WHERE LOWER(nombre) = LOWER(:nombre) AND id <> :id LIMIT 1");
    $stmt->execute([
        'nombre' => $nombre,
        'id' => $id
    ]);
    return $stmt->fetch() ?: null;
}

/**
 * Actualiza el nombre de un método de pago
 * @param int $id
 * @param string $nombre
 * @return bool
 */
function dbActualizarMetodoPago($id, $nombre) {
    $db = obtenerConexion();
    $stmt = $db->prepare("UPDATE metodos_pago SET nombre = :nombre WHERE id = :id");
    return $stmt->execute([
        'id' => $id,
        'nombre' => $nombre
    ]);
}

