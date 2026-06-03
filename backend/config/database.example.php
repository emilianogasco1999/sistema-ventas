<?php
/**
 * Configuración de conexión a la base de datos
 * COPIAR a database.php y completar con tus datos locales
 */

define('DB_HOST', 'localhost');
define('DB_NAME', 'forrajeria');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_CHARSET', 'utf8mb4');

/**
 * Obtiene la conexión PDO única
 * @return PDO
 */
function obtenerConexion() {
    static $db = null;
    
    if ($db === null) {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ];
        
        try {
            $db = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            die(json_encode(['success' => false, 'error' => 'Error de conexión a la base de datos']));
        }
    }
    
    return $db;
}