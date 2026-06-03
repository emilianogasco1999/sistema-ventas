<?php
/**
 * Modelo de Roles - Consultas SQL puras
 */

require_once __DIR__ . '/../config/database.php';

/**
 * Busca un rol por su nombre (insensible a mayúsculas/minúsculas)
 * @param string $nombre
 * @return array|null
 */
function dbBuscarRolPorNombre($nombre) {
    $db = obtenerConexion();
    $stmt = $db->prepare("SELECT * FROM roles WHERE LOWER(nombre) = LOWER(:nombre) LIMIT 1");
    $stmt->execute(['nombre' => $nombre]);
    return $stmt->fetch() ?: null;
}

/**
 * Inserta un nuevo rol en la base de datos
 * @param string $nombre
 * @param int $usuarioCreadorId
 * @return bool
 */
function dbInsertarRol($nombre, $usuarioCreadorId) {
    $db = obtenerConexion();
    $stmt = $db->prepare("INSERT INTO roles (nombre, usuario_creador_id) VALUES (:nombre, :usuario_creador_id)");
    return $stmt->execute([
        'nombre' => $nombre,
        'usuario_creador_id' => $usuarioCreadorId
    ]);
}

/**
 * Obtiene el listado de todos los roles registrados
 * @return array
 */
function dbListarRoles() {
    $db = obtenerConexion();
    $stmt = $db->query("
        SELECT 
            r.id,
            r.nombre,
            r.activo,
            r.created_at,
            p.nombre AS creador_nombre,
            p.apellido AS creador_apellido
        FROM roles r
        LEFT JOIN usuarios u ON r.usuario_creador_id = u.id
        LEFT JOIN personas p ON u.persona_id = p.id
        ORDER BY r.id DESC
    ");
    return $stmt->fetchAll();
}
