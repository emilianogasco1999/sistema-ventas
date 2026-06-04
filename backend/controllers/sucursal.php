<?php
/**
 * Controlador de Sucursales
 */

require_once __DIR__ . '/../models/sucursal.php';

/**
 * Middleware: Requiere que el usuario tenga rol Super Admin
 * Si no lo tiene, termina la request con error 403
 */
function requerirSuperAdmin() {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    
    if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'error' => 'No autenticado'
        ]);
        exit;
    }
    
    $rol = $_SESSION['usuario_rol'] ?? '';
    
    if (strtoupper($rol) !== 'SUPER ADMIN') {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'error' => 'Acceso denegado. Se requiere rol Super Admin'
        ]);
        exit;
    }
}

/**
 * Valida el formato de email
 * @param string|null $email
 * @return bool
 */
function validarEmail($email) {
    if ($email === null || $email === '') {
        return true; // Es opcional
    }
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Valida el formato de teléfono
 * @param string|null $telefono
 * @return bool
 */
function validarTelefono($telefono) {
    if ($telefono === null || $telefono === '') {
        return true; // Es opcional
    }
    // Solo números, entre 8 y 15 dígitos
    return preg_match('/^[0-9]{8,15}$/', $telefono);
}

/**
 * Controlador: Crear una nueva sucursal
 */
function ctrlCrearSucursal() {
    // Verificar permisos
    requerirSuperAdmin();
    
    // Leer datos del request
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        $input = $_POST;
    }
    
    // Obtener campos
    $nombre = isset($input['nombre']) ? trim($input['nombre']) : '';
    $direccion = isset($input['direccion']) ? trim($input['direccion']) : null;
    $telefono = isset($input['telefono']) ? trim($input['telefono']) : null;
    $email = isset($input['email']) ? trim($input['email']) : null;
    
    // ========================================
    // VALIDACIONES
    // ========================================
    
    // Nombre es obligatorio
    if (empty($nombre)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'El nombre es obligatorio'
        ]);
        exit;
    }
    
    // Email válido (si se informa)
    if (!validarEmail($email)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'El email no tiene un formato válido'
        ]);
        exit;
    }
    
    // Teléfono válido (si se informa)
    if (!validarTelefono($telefono)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'El teléfono debe contener solo números (8-15 dígitos)'
        ]);
        exit;
    }
    
    // Verificar si ya existe una sucursal con el mismo nombre
    if (dbExisteSucursalPorNombre($nombre)) {
        http_response_code(409);
        echo json_encode([
            'success' => false,
            'error' => 'Ya existe una sucursal con ese nombre'
        ]);
        exit;
    }
    
    // ========================================
    // INSERCIÓN
    // ========================================
    
    try {
        $id = dbInsertarSucursal($nombre, $direccion, $telefono, $email);
        
        // Obtener la sucursal creada para devolverla completa
        $sucursal = dbBuscarSucursalPorId($id);
        
        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Sucursal creada correctamente',
            'data' => $sucursal
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Error al crear la sucursal'
        ]);
    }
}

/**
 * Controlador: Listar todas las sucursales
 */
function ctrlListarSucursales() {
    try {
        $sucursales = dbListarSucursales();
        
        echo json_encode([
            'success' => true,
            'data' => $sucursales
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Error al obtener las sucursales'
        ]);
    }
}