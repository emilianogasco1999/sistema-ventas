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
    $stmt = $db->query("SELECT * FROM metodos_pago ORDER BY id DESC");
    return $stmt->fetchAll();
}
