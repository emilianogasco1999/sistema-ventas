<?php
/**
 * Modelo de Marcas - Consultas SQL puras
 */

require_once __DIR__ . '/../config/database.php';

/**
 * Busca una marca por su nombre (insensible a mayúsculas/minúsculas)
 * @param string $nombre
 * @return array|null
 */
function dbBuscarMarcaPorNombre($nombre) {
    $db = obtenerConexion();
    $stmt = $db->prepare("SELECT * FROM marcas WHERE LOWER(nombre) = LOWER(:nombre) LIMIT 1");
    $stmt->execute(['nombre' => $nombre]);
    return $stmt->fetch() ?: null;
}

/**
 * Inserta una nueva marca en la base de datos
 * @param string $nombre
 * @return bool
 */
function dbInsertarMarca($nombre) {
    $db = obtenerConexion();
    $stmt = $db->prepare("INSERT INTO marcas (nombre) VALUES (:nombre)");
    return $stmt->execute(['nombre' => $nombre]);
}

/**
 * Obtiene el listado de todas las marcas registradas
 * @return array
 */
function dbListarMarcas() {
    $db = obtenerConexion();
    $stmt = $db->query("SELECT * FROM marcas ORDER BY id DESC");
    return $stmt->fetchAll();
}

/**
 * Busca una marca por su ID
 * @param int $id
 * @return array|null
 */
function dbBuscarMarcaPorId($id) {
    $db = obtenerConexion();
    $stmt = $db->prepare("SELECT * FROM marcas WHERE id = :id LIMIT 1");
    $stmt->execute(['id' => $id]);
    return $stmt->fetch() ?: null;
}

/**
 * Busca una marca por su nombre excluyendo un ID específico (para edición)
 * @param string $nombre
 * @param int $id
 * @return array|null
 */
function dbBuscarMarcaPorNombreExceptoId($nombre, $id) {
    $db = obtenerConexion();
    $stmt = $db->prepare("SELECT * FROM marcas WHERE LOWER(nombre) = LOWER(:nombre) AND id <> :id LIMIT 1");
    $stmt->execute([
        'nombre' => $nombre,
        'id' => $id
    ]);
    return $stmt->fetch() ?: null;
}

/**
 * Actualiza el nombre de una marca en la base de datos
 * @param int $id
 * @param string $nombre
 * @return bool
 */
function dbActualizarMarca($id, $nombre) {
    $db = obtenerConexion();
    $stmt = $db->prepare("UPDATE marcas SET nombre = :nombre WHERE id = :id");
    return $stmt->execute([
        'id' => $id,
        'nombre' => $nombre
    ]);
}

/**
 * Cuenta la cantidad de productos asociados a una marca específica
 * @param int $marcaId
 * @return int
 */
function dbContarProductosPorMarca($marcaId) {
    $db = obtenerConexion();
    $stmt = $db->prepare("SELECT COUNT(*) FROM productos WHERE marca_id = :marca_id");
    $stmt->execute(['marca_id' => $marcaId]);
    return (int)$stmt->fetchColumn();
}

/**
 * Elimina una marca físicamente de la base de datos
 * @param int $id
 * @return bool
 */
function dbEliminarMarca($id) {
    $db = obtenerConexion();
    $stmt = $db->prepare("DELETE FROM marcas WHERE id = :id");
    return $stmt->execute(['id' => $id]);
}

/**
 * Obtiene el listado de marcas con filtros de búsqueda, ordenamiento y paginación
 * @param array $params Parámetros de filtrado, paginación y ordenamiento
 * @return array
 */
function dbListarMarcasPaginado($params = []) {
    $db = obtenerConexion();
    
    // Determinar si se debe paginar
    $paginar = isset($params['paginar']) ? ($params['paginar'] === true || $params['paginar'] === 'true' || $params['paginar'] == 1) : true;
    
    $page = max(1, intval($params['page'] ?? 1));
    $perPage = min(100, max(1, intval($params['per_page'] ?? 10)));
    $offset = ($page - 1) * $perPage;
    
    $sort = $params['sort'] ?? 'nombre';
    $order = strtoupper($params['order'] ?? 'ASC');
    if (!in_array($order, ['ASC', 'DESC'])) {
        $order = 'ASC';
    }
    
    // Columnas ordenables válidas
    $columnasValidas = ['id', 'nombre'];
    if (!in_array($sort, $columnasValidas)) {
        $sort = 'nombre';
    }
    
    $search = trim($params['search'] ?? '');
    
    // Condiciones WHERE
    $condiciones = [];
    $bindings = [];
    
    if ($search !== '') {
        $condiciones[] = "nombre LIKE :search";
        $bindings['search'] = '%' . $search . '%';
    }
    
    $where = '';
    if (count($condiciones) > 0) {
        $where = 'WHERE ' . implode(' AND ', $condiciones);
    }
    
    // Query base
    $sqlBase = "FROM marcas $where";
    
    // Contar total
    $stmtCount = $db->prepare("SELECT COUNT(*) $sqlBase");
    $stmtCount->execute($bindings);
    $total = (int)$stmtCount->fetchColumn();
    
    // Obtener datos
    $sql = "SELECT id, nombre $sqlBase ORDER BY $sort $order";
    if ($paginar) {
        $sql .= " LIMIT :limit OFFSET :offset";
    }
    
    $stmt = $db->prepare($sql);
    
    if ($paginar) {
        $stmt->bindValue(':limit', $perPage, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    }
    
    foreach ($bindings as $key => $value) {
        $stmt->bindValue(":$key", $value);
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


