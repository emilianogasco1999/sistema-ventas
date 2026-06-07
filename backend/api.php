<?php
/**
 * API - Punto único de entrada
 * 
 * Recibe acciones via GET o POST y las distribuye a los controladores
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Manejar preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

// Iniciar sesión para todas las requests
session_start();

// Obtener la acción
$accion = $_GET['accion'] ?? $_POST['accion'] ?? '';

// Enrutamiento
switch ($accion) {
    // Auth
    case 'login':
        require_once __DIR__ . '/controllers/auth.php';
        ctrlLogin();
        break;
    
    case 'logout':
        require_once __DIR__ . '/controllers/auth.php';
        ctrlLogout();
        break;
    
    case 'verificar_sesion':
        require_once __DIR__ . '/controllers/auth.php';
        ctrlVerificarSesion();
        break;
    
    // Dashboard
    case 'dashboard_stats':
        require_once __DIR__ . '/controllers/dashboard.php';
        ctrlDashboardStats();
        break;
    
    // Roles
    case 'crear_rol':
        require_once __DIR__ . '/controllers/roles.php';
        ctrlCrearRol();
        break;
        
    case 'listar_roles':
        require_once __DIR__ . '/controllers/roles.php';
        ctrlListarRoles();
        break;
        
    case 'editar_rol':
        require_once __DIR__ . '/controllers/roles.php';
        ctrlEditarRol();
        break;

    case 'eliminar_rol':
        require_once __DIR__ . '/controllers/roles.php';
        ctrlEliminarRol();
        break;
    
    // Sucursales
    case 'crear_sucursal':
        require_once __DIR__ . '/controllers/sucursal.php';
        ctrlCrearSucursal();
        break;
    
    case 'listar_sucursales':
        require_once __DIR__ . '/controllers/sucursal.php';
        ctrlListarSucursales();
        break;
    
    case 'actualizar_sucursal':
        require_once __DIR__ . '/controllers/sucursal.php';
        ctrlActualizarSucursal();
        break;
    
    // Marcas
    case 'crear_marca':
        require_once __DIR__ . '/controllers/marcas.php';
        ctrlCrearMarca();
        break;
        
    case 'listar_marcas':
        require_once __DIR__ . '/controllers/marcas.php';
        ctrlListarMarcas();
        break;
        
    case 'obtener_marca':
        require_once __DIR__ . '/controllers/marcas.php';
        ctrlObtenerMarca();
        break;
        
    case 'actualizar_marca':
        require_once __DIR__ . '/controllers/marcas.php';
        ctrlActualizarMarca();
        break;
    
    case 'eliminar_marca':
        require_once __DIR__ . '/controllers/marcas.php';
        ctrlEliminarMarca();
        break;
    
    // Categorías
    case 'crear_categoria':
        require_once __DIR__ . '/controllers/categorias.php';
        ctrlCrearCategoria();
        break;
        
    case 'listar_categorias':
        require_once __DIR__ . '/controllers/categorias.php';
        ctrlListarCategorias();
        break;
    
    // Fallback
    default:
        echo json_encode([
            'success' => false,
            'error' => 'Acción no reconocida'
        ]);
        break;
}