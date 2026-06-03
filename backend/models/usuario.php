<?php
/**
 * Modelo de Usuarios - Consultas SQL puras
 */

require_once __DIR__ . '/../config/database.php';

/**
 * Busca un usuario por username
 * @param string $username
 * @return array|null
 */
function dbBuscarUsuarioPorUsername($username) {
    $db = obtenerConexion();
    $stmt = $db->prepare("
        SELECT 
            u.id,
            u.username,
            u.password,
            u.activo,
            p.id as persona_id,
            p.nombre,
            p.apellido,
            p.email,
            r.nombre as rol
        FROM usuarios u
        INNER JOIN personas p ON u.persona_id = p.id
        INNER JOIN roles r ON u.role_id = r.id
        WHERE u.username = :username
        LIMIT 1
    ");
    $stmt->execute(['username' => $username]);
    return $stmt->fetch() ?: null;
}

/**
 * Obtiene un usuario por ID
 * @param int $id
 * @return array|null
 */
function dbObtenerUsuarioPorId($id) {
    $db = obtenerConexion();
    $stmt = $db->prepare("
        SELECT 
            u.id,
            u.username,
            u.activo,
            p.nombre,
            p.apellido,
            r.nombre as rol
        FROM usuarios u
        INNER JOIN personas p ON u.persona_id = p.id
        INNER JOIN roles r ON u.role_id = r.id
        WHERE u.id = :id
    ");
    $stmt->execute(['id' => $id]);
    return $stmt->fetch() ?: null;
}