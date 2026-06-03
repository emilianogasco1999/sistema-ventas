<?php
/**
 * Controlador de Autenticación
 */

require_once __DIR__ . '/../models/usuario.php';

/**
 * Procesa el login
 */
function ctrlLogin() {
    // Forzar inicio de sesión limpio
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    
    // Leer datos del request
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Fallback a $_POST si no viene JSON
    if (!$input) {
        $input = $_POST;
    }
    
    $username = trim($input['username'] ?? '');
    $password = $input['password'] ?? '';
    
    // Validaciones básicas
    if (empty($username) || empty($password)) {
        echo json_encode([
            'success' => false,
            'error' => 'Usuario y contraseña son requeridos'
        ]);
        exit;
    }
    
    // Buscar usuario
    $usuario = dbBuscarUsuarioPorUsername($username);
    
    if (!$usuario) {
        echo json_encode([
            'success' => false,
            'error' => 'Credenciales incorrectas'
        ]);
        exit;
    }
    
    // Verificar si está activo
    if (!$usuario['activo']) {
        echo json_encode([
            'success' => false,
            'error' => 'Usuario desactivado'
        ]);
        exit;
    }
    
    // Verificar contraseña
    if (!password_verify($password, $usuario['password'])) {
        echo json_encode([
            'success' => false,
            'error' => 'Credenciales incorrectas'
        ]);
        exit;
    }
    
    // Login exitoso - escribir variables de sesión
    $_SESSION['usuario_id'] = $usuario['id'];
    $_SESSION['usuario_nombre'] = $usuario['nombre'] . ' ' . $usuario['apellido'];
    $_SESSION['usuario_rol'] = $usuario['rol'];
    $_SESSION['logged_in'] = true;
    
    echo json_encode([
        'success' => true,
        'message' => 'Login exitoso',
        'user' => [
            'id' => $usuario['id'],
            'nombre' => $usuario['nombre'] . ' ' . $usuario['apellido'],
            'rol' => $usuario['rol']
        ]
    ]);
    exit;
}

/**
 * Cierra la sesión
 */
function ctrlLogout() {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    session_destroy();
    
    echo json_encode([
        'success' => true,
        'message' => 'Sesión cerrada'
    ]);
    exit;
}

/**
 * Verifica si el usuario está logueado
 */
function ctrlVerificarSesion() {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    
    if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
        echo json_encode([
            'success' => false,
            'authenticated' => false
        ]);
        exit;
    }
    
    echo json_encode([
        'success' => true,
        'authenticated' => true,
        'user' => [
            'id' => $_SESSION['usuario_id'] ?? 0,
            'nombre' => $_SESSION['usuario_nombre'] ?? '',
            'rol' => $_SESSION['usuario_rol'] ?? ''
        ]
    ]);
    exit;
}