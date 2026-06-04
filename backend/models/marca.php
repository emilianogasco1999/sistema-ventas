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
