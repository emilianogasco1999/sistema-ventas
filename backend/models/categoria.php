<?php
/**
 * Modelo de Categorías - Consultas SQL puras
 */

require_once __DIR__ . '/../config/database.php';

/**
 * Busca una categoría por su nombre (insensible a mayúsculas/minúsculas)
 * @param string $nombre
 * @return array|null
 */
function dbBuscarCategoriaPorNombre($nombre) {
    $db = obtenerConexion();
    $stmt = $db->prepare("SELECT * FROM categorias WHERE LOWER(nombre) = LOWER(:nombre) LIMIT 1");
    $stmt->execute(['nombre' => $nombre]);
    return $stmt->fetch() ?: null;
}

/**
 * Inserta una nueva categoría en la base de datos
 * @param string $nombre
 * @return bool
 */
function dbInsertarCategoria($nombre) {
    $db = obtenerConexion();
    $stmt = $db->prepare("INSERT INTO categorias (nombre) VALUES (:nombre)");
    return $stmt->execute(['nombre' => $nombre]);
}

/**
 * Obtiene el listado de todas las categorías ordenadas alfabéticamente
 * @return array
 */
function dbListarCategorias() {
    $db = obtenerConexion();
    $stmt = $db->query("SELECT * FROM categorias ORDER BY nombre ASC");
    return $stmt->fetchAll();
}

/**
 * Obtiene el listado de categorías con paginación
 * @param array $params Parámetros de paginación
 * @return array
 */
function dbListarCategoriasPaginado($params = []) {
    $db = obtenerConexion();
    
    $paginar = isset($params['paginar']) ? ($params['paginar'] === true || $params['paginar'] === 'true' || $params['paginar'] == 1) : true;
    
    $page = max(1, intval($params['page'] ?? 1));
    $perPage = min(100, max(1, intval($params['per_page'] ?? 8)));
    $offset = ($page - 1) * $perPage;
    
    $sort = 'nombre';
    $order = 'ASC';
    
    // Contar total
    $stmtCount = $db->query("SELECT COUNT(*) FROM categorias");
    $total = (int)$stmtCount->fetchColumn();
    
    // Obtener datos
    $sql = "SELECT id, nombre FROM categorias ORDER BY $sort $order";
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
 * Busca una categoría por su ID
 * @param int $id
 * @return array|null
 */
function dbBuscarCategoriaPorId($id) {
    $db = obtenerConexion();
    $stmt = $db->prepare("SELECT * FROM categorias WHERE id = :id LIMIT 1");
    $stmt->execute(['id' => $id]);
    return $stmt->fetch() ?: null;
}

/**
 * Busca una categoría por su nombre excluyendo un ID específico
 * @param string $nombre
 * @param int $id
 * @return array|null
 */
function dbBuscarCategoriaPorNombreExceptoId($nombre, $id) {
    $db = obtenerConexion();
    $stmt = $db->prepare("SELECT * FROM categorias WHERE LOWER(nombre) = LOWER(:nombre) AND id <> :id LIMIT 1");
    $stmt->execute([
        'nombre' => $nombre,
        'id' => $id
    ]);
    return $stmt->fetch() ?: null;
}

/**
 * Actualiza el nombre de una categoría
 * @param int $id
 * @param string $nombre
 * @return bool
 */
function dbActualizarCategoria($id, $nombre) {
    $db = obtenerConexion();
    $stmt = $db->prepare("UPDATE categorias SET nombre = :nombre WHERE id = :id");
    return $stmt->execute([
        'id' => $id,
        'nombre' => $nombre
    ]);
}

