<?php
/**
 * Controlador de Dashboard
 */

require_once __DIR__ . '/../config/database.php';

/**
 * Obtiene estadísticas para el dashboard
 */
function ctrlDashboardStats() {
    // Verificar que esté logueado
    if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
        echo json_encode([
            'success' => false,
            'error' => 'No autenticado'
        ]);
        exit;
    }
    
    $db = obtenerConexion();
    $sucursal_id = $_SESSION['sucursal_id'] ?? null;
    
    try {
        // Ventas de hoy
        $stmtVentasHoy = $db->prepare("
            SELECT COUNT(*) as total, COALESCE(SUM(total), 0) as monto
            FROM ventas
            WHERE DATE(created_at) = CURDATE()
            AND estado = 'pagada'
        ");
        $stmtVentasHoy->execute();
        $ventasHoy = $stmtVentasHoy->fetch();
        
        // Total de productos
        $stmtProductos = $db->prepare("SELECT COUNT(*) as total FROM productos WHERE activo = 1");
        $stmtProductos->execute();
        $totalProductos = $stmtProductos->fetch();
        
        // Productos con stock bajo (menor a 5)
        $stmtStockBajo = $db->prepare("
            SELECT COUNT(*) as total
            FROM inventarios i
            INNER JOIN productos p ON i.producto_variante_id = p.id
            WHERE i.stock_actual < 5
            AND p.activo = 1
        ");
        $stmtStockBajo->execute();
        $stockBajo = $stmtStockBajo->fetch();
        
        // Clientes registrados
        $stmtClientes = $db->prepare("SELECT COUNT(*) as total FROM clientes WHERE activo = 1");
        $stmtClientes->execute();
        $totalClientes = $stmtClientes->fetch();
        
        echo json_encode([
            'success' => true,
            'stats' => [
                'ventas_hoy' => (int)$ventasHoy['total'],
                'monto_ventas_hoy' => (float)$ventasHoy['monto'],
                'total_productos' => (int)$totalProductos['total'],
                'stock_bajo' => (int)$stockBajo['total'],
                'total_clientes' => (int)$totalClientes['total']
            ]
        ]);
        
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'error' => 'Error al obtener estadísticas'
        ]);
    }
    
    exit;
}