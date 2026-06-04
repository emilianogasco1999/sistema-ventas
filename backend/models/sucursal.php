<?php
/**
 * Modelo de Sucursales - Consultas SQL puras
 */

require_once __DIR__ . '/../config/database.php';

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
 * Obtiene el listado de todas las sucursales
 * @return array
 */
function dbListarSucursales() {
    $db = obtenerConexion();
    $stmt = $db->query("
        SELECT 
            id,
            nombre,
            direccion,
            telefono,
            email,
            activa,
            created_at
        FROM sucursales
        ORDER BY id DESC
    ");
    return $stmt->fetchAll();
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
