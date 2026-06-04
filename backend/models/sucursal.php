<?php
/**
 * Modelo de Sucursales - Consultas SQL puras con soporte para paginación
 */

require_once __DIR__ . '/../config/database.php';

/**
 * Obtiene el listado de sucursales con filtros, ordenamiento y paginación
 * @param array $params Array asociativo con: search, estado, sort, order, page, per_page
 * @return array ['data' => [...], 'total' => int, 'page' => int, 'per_page' => int, 'total_pages' => int]
 */
function dbListarSucursales($params = []) {
    $db = obtenerConexion();
    
    // Valores por defecto
    $page = max(1, intval($params['page'] ?? 1));
    $perPage = min(100, max(1, intval($params['per_page'] ?? 10)));
    $offset = ($page - 1) * $perPage;
    
    $sort = $params['sort'] ?? 'nombre';
    $order = strtoupper($params['order'] ?? 'ASC');
    if (!in_array($order, ['ASC', 'DESC'])) {
        $order = 'ASC';
    }
    // Validar columnas ordenables
    $columnasValidas = ['id', 'nombre', 'direccion', 'telefono', 'email', 'activa', 'created_at'];
    if (!in_array($sort, $columnasValidas)) {
        $sort = 'nombre';
    }
    
    $search = trim($params['search'] ?? '');
    $estado = $params['estado'] ?? 'todas';
    
    // Construir condiciones WHERE
    $condiciones = [];
    $bindings = [];
    
    // Búsqueda por nombre
    if ($search !== '') {
        $condiciones[] = "nombre LIKE :search";
        $bindings['search'] = '%' . $search . '%';
    }
    
    // Filtro por estado
    if ($estado === 'activas') {
        $condiciones[] = "activa = 1";
    } elseif ($estado === 'inactivas') {
        $condiciones[] = "activa = 0";
    }
    // 'todas' no agrega condición
    
    $where = '';
    if (count($condiciones) > 0) {
        $where = 'WHERE ' . implode(' AND ', $condiciones);
    }
    
    // Query base
    $sqlBase = "FROM sucursales $where";
    
    // Contar total
    $stmtCount = $db->prepare("SELECT COUNT(*) $sqlBase");
    $stmtCount->execute($bindings);
    $total = (int)$stmtCount->fetchColumn();
    
    // Obtener datos paginados
    $sql = "SELECT id, nombre, direccion, telefono, email, activa, created_at $sqlBase ORDER BY $sort $order LIMIT :limit OFFSET :offset";
    $stmt = $db->prepare($sql);
    $stmt->bindValue(':limit', $perPage, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    foreach ($bindings as $key => $value) {
        $stmt->bindValue(":$key", $value);
    }
    $stmt->execute();
    $data = $stmt->fetchAll();
    
    $totalPages = $total > 0 ? ceil($total / $perPage) : 1;
    
    return [
        'data' => $data,
        'total' => $total,
        'page' => $page,
        'per_page' => $perPage,
        'total_pages' => $totalPages
    ];
}

/**
 * Inserta una nueva sucursal en la base de datos
 * @param string $nombre
 * @param string|null $direccion
 * @param string|null $telefono
 * @param string|null $email
 * @return int ID de la sucursal insertada
 */
function dbInsertarSucursal($nombre, $direccion = null, $telefono = null, $email = null) {
    $db = obtenerConexion();
    $stmt = $db->prepare("
        INSERT INTO sucursales (nombre, direccion, telefono, email) 
        VALUES (:nombre, :direccion, :telefono, :email)
    ");
    $stmt->execute([
        'nombre' => $nombre,
        'direccion' => $direccion,
        'telefono' => $telefono,
        'email' => $email
    ]);
    return (int)$db->lastInsertId();
}

/**
 * Busca una sucursal por ID
 * @param int $id
 * @return array|null
 */
function dbBuscarSucursalPorId($id) {
    $db = obtenerConexion();
    $stmt = $db->prepare("SELECT * FROM sucursales WHERE id = :id LIMIT 1");
    $stmt->execute(['id' => $id]);
    return $stmt->fetch() ?: null;
}

/**
 * Verifica si ya existe una sucursal con el mismo nombre
 * @param string $nombre
 * @return bool
 */
function dbExisteSucursalPorNombre($nombre) {
    $db = obtenerConexion();
    $stmt = $db->prepare("
        SELECT COUNT(*) FROM sucursales 
        WHERE LOWER(nombre) = LOWER(:nombre)
    ");
    $stmt->execute(['nombre' => $nombre]);
    return (int)$stmt->fetchColumn() > 0;
}
