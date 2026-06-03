<?php
/**
 * Dashboard - Página principal después del login
 */

// Iniciar sesión y verificar autenticación
session_start();

// Si no hay sesión activa, redirigir al login
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    header('Location: ../pages/login.php');
    exit;
}

$userRole = $_SESSION['usuario_rol'] ?? '';
$userName = $_SESSION['usuario_nombre'] ?? '';

// Cargar componentes
require_once __DIR__ . '/../componentes/sidebar.php';
require_once __DIR__ . '/../componentes/header.php';
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - Forrajería</title>
    <link rel="stylesheet" href="../../assets/css/tailwind.min.css">
    <link rel="stylesheet" href="../../assets/css/dark-mode.css">
    <link rel="stylesheet" href="../../assets/css/dashboard.css">
    <link rel="stylesheet" href="../../assets/css/responsive.css">
    <script src="../../assets/js/lucide.min.js"></script>
</head>
<body class="bg-gray-100">
    <div class="flex min-h-screen dashboard-layout">
        <!-- Sidebar -->
        <?= renderSidebar('dashboard', $userRole); ?>
        
        <!-- Contenido principal -->
        <main class="flex-1 flex flex-col">
            <!-- Header -->
            <?= renderHeader('Dashboard', 'Resumen de la actividad'); ?>
            
            <!-- Contenido del Dashboard -->
            <div class="flex-1 p-6 overflow-auto">
                <!-- Stats Cards -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 fade-in">
                    <!-- Ventas del día -->
                    <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100 stat-card">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm text-gray-500 mb-1">Ventas de Hoy</p>
                                <p class="text-2xl font-bold text-gray-800" id="statVentas">-</p>
                            </div>
                            <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                <i data-lucide="shopping-cart" class="w-6 h-6 text-blue-600"></i>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Monto del día -->
                    <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100 stat-card">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm text-gray-500 mb-1">Recaudación Hoy</p>
                                <p class="text-2xl font-bold text-green-600" id="statMonto">-</p>
                            </div>
                            <div class="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                                <i data-lucide="dollar-sign" class="w-6 h-6 text-green-600"></i>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Total Productos -->
                    <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100 stat-card">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm text-gray-500 mb-1">Total Productos</p>
                                <p class="text-2xl font-bold text-gray-800" id="statProductos">-</p>
                            </div>
                            <div class="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                                <i data-lucide="package" class="w-6 h-6 text-purple-600"></i>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Stock Bajo -->
                    <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100 stat-card">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm text-gray-500 mb-1">Stock Bajo</p>
                                <p class="text-2xl font-bold text-red-600" id="statStockBajo">-</p>
                            </div>
                            <div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                                <i data-lucide="alert-triangle" class="w-6 h-6 text-red-600"></i>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Contenido adicional -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Lista de acciones rápidas -->
                    <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <h3 class="text-lg font-semibold text-gray-800 mb-4">Acciones Rápidas</h3>
                        <div class="grid grid-cols-2 gap-3">
                            <button class="flex items-center gap-2 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors quick-action-btn">
                                <i data-lucide="plus-circle" class="w-5 h-5 text-green-600"></i>
                                <span class="text-sm font-medium text-gray-700">Nueva Venta</span>
                            </button>
                            <button class="flex items-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors quick-action-btn">
                                <i data-lucide="package-plus" class="w-5 h-5 text-blue-600"></i>
                                <span class="text-sm font-medium text-gray-700">Agregar Producto</span>
                            </button>
                            <button class="flex items-center gap-2 p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors quick-action-btn">
                                <i data-lucide="arrow-down-circle" class="w-5 h-5 text-yellow-600"></i>
                                <span class="text-sm font-medium text-gray-700">Ingreso Stock</span>
                            </button>
                            <button class="flex items-center gap-2 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors quick-action-btn">
                                <i data-lucide="user-plus" class="w-5 h-5 text-purple-600"></i>
                                <span class="text-sm font-medium text-gray-700">Nuevo Cliente</span>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Mensaje de bienvenida -->
                    <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-sm p-6 text-white">
                        <h3 class="text-lg font-semibold mb-2">¡Bienvenido al Sistema!</h3>
                        <p class="text-green-100 text-sm mb-4">
                            Este es tu panel de control. Aquí podrás ver un resumen de la actividad de tu forrajería.
                        </p>
                        <div class="flex items-center gap-2 text-sm text-green-100">
                            <i data-lucide="info" class="w-4 h-4"></i>
                            <span>Los datos se actualizan en tiempo real</span>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <script src="../../assets/js/jquery.min.js"></script>
    <script src="../../assets/js/sweetalert2.all.min.js"></script>
    <script src="../../assets/js/dark-mode-toggle.js"></script>
    <script src="../../assets/js/responsive-sidebar.js"></script>
    <script src="../js/dashboard.js"></script>
</body>
</html>