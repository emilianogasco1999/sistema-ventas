<?php
/**
 * Panel de Configuración - Forrajería
 * 
 * Módulo de administración para configurar el sistema.
 * Solo accesible para Administradores.
 */

// Iniciar sesión y verificar autenticación
session_start();

if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    header('Location: ../../../pages/login.php');
    exit;
}

$userRole = $_SESSION['usuario_rol'] ?? '';
$userName = $_SESSION['usuario_nombre'] ?? '';

// Cargar componentes
require_once __DIR__ . '/../../componentes/sidebar.php';
require_once __DIR__ . '/../../componentes/header.php';
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Configuración - Forrajería</title>
    <!-- Assets desde src/pages/config/ -> ../../../assets/ (3 niveles arriba) -->
    <link rel="stylesheet" href="../../../assets/css/tailwind.min.css">
    <link rel="stylesheet" href="../../../assets/css/dark-mode.css">
    <link rel="stylesheet" href="../../../assets/css/dashboard.css">
    <link rel="stylesheet" href="../../../assets/css/responsive.css">
    <script src="../../../assets/js/lucide.min.js"></script>
</head>
<body class="bg-gray-100">
    <div class="flex min-h-screen dashboard-layout">
        <!-- Sidebar -->
        <?= renderSidebar('config_index', 'Administrador'); ?>
        
        <!-- Contenido principal -->
        <main class="flex-1 flex flex-col">
            <!-- Header -->
            <?= renderHeader('Configuración', 'Administración del sistema', $userName, $userRole); ?>
            
            <!-- Contenido -->
            <div class="flex-1 p-6 overflow-auto">
                 <!-- Info adicional -->
                <div class="my-8 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                    <div class="flex items-start gap-4">
                        <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <i data-lucide="info" class="w-5 h-5 text-blue-600"></i>
                        </div>
                        <div>
                            <h4 class="font-semibold text-gray-800 mb-1">Panel de Administración</h4>
                            <p class="text-gray-600 text-sm">
                                Desde aquí podrás configurar todos los aspectos del sistema de gestión. 
                                Los cambios realizados aquí afectarán a todo el sistema.
                            </p>
                        </div>
                    </div>
                </div>
                <!-- Grid de opciones de configuración -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    
                    <!-- Usuarios -->
                    <a href="usuarios.php" class="config-card bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:border-green-500 transition-colors group">
                        <div class="flex items-center gap-4 mb-4">
                            <div class="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                                <i data-lucide="users" class="w-7 h-7 text-blue-600 group-hover:text-white transition-colors"></i>
                            </div>
                            <div>
                                <h3 class="text-lg font-semibold text-gray-800">Usuarios</h3>
                                <p class="text-sm text-gray-500">Gestionar cuentas</p>
                            </div>
                        </div>
                        <p class="text-gray-600 text-sm">Crear, editar y desactivar usuarios del sistema.</p>
                    </a>
                    
                    <!-- Roles -->
                    <a href="roles.php" class="config-card bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:border-green-500 transition-colors group">
                        <div class="flex items-center gap-4 mb-4">
                            <div class="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center group-hover:bg-purple-500 transition-colors">
                                <i data-lucide="shield" class="w-7 h-7 text-purple-600 group-hover:text-white transition-colors"></i>
                            </div>
                            <div>
                                <h3 class="text-lg font-semibold text-gray-800">Roles</h3>
                                <p class="text-sm text-gray-500">Permisos y accesos</p>
                            </div>
                        </div>
                        <p class="text-gray-600 text-sm">Definir roles y permisos del sistema.</p>
                    </a>
                    
                    <!-- Sucursales -->
                    <a href="sucursales.php" class="config-card bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:border-green-500 transition-colors group">
                        <div class="flex items-center gap-4 mb-4">
                            <div class="w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center group-hover:bg-green-500 transition-colors">
                                <i data-lucide="store" class="w-7 h-7 text-green-600 group-hover:text-white transition-colors"></i>
                            </div>
                            <div>
                                <h3 class="text-lg font-semibold text-gray-800">Sucursales</h3>
                                <p class="text-sm text-gray-500">Puntos de venta</p>
                            </div>
                        </div>
                        <p class="text-gray-600 text-sm">Administrar sucursales y locales.</p>
                    </a>
                    
                    <!-- Métodos de Pago -->
                    <a href="metodos-pago.php" class="config-card bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:border-green-500 transition-colors group">
                        <div class="flex items-center gap-4 mb-4">
                            <div class="w-14 h-14 rounded-xl bg-yellow-100 flex items-center justify-center group-hover:bg-yellow-500 transition-colors">
                                <i data-lucide="credit-card" class="w-7 h-7 text-yellow-600 group-hover:text-white transition-colors"></i>
                            </div>
                            <div>
                                <h3 class="text-lg font-semibold text-gray-800">Métodos de Pago</h3>
                                <p class="text-sm text-gray-500">Formas de cobro</p>
                            </div>
                        </div>
                        <p class="text-gray-600 text-sm">Configurar medios de pago disponibles.</p>
                    </a>
                    
                    <!-- Categorías -->
                    <a href="categorias.php" class="config-card bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:border-green-500 transition-colors group">
                        <div class="flex items-center gap-4 mb-4">
                            <div class="w-14 h-14 rounded-xl bg-pink-100 flex items-center justify-center group-hover:bg-pink-500 transition-colors">
                                <i data-lucide="tag" class="w-7 h-7 text-pink-600 group-hover:text-white transition-colors"></i>
                            </div>
                            <div>
                                <h3 class="text-lg font-semibold text-gray-800">Categorías</h3>
                                <p class="text-sm text-gray-500">Tipos de productos</p>
                            </div>
                        </div>
                        <p class="text-gray-600 text-sm">Gestionar categorías de productos.</p>
                    </a>
                    
                    <!-- Marcas -->
                    <a href="marcas.php" class="config-card bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:border-green-500 transition-colors group">
                        <div class="flex items-center gap-4 mb-4">
                            <div class="w-14 h-14 rounded-xl bg-red-100 flex items-center justify-center group-hover:bg-red-500 transition-colors">
                                <i data-lucide="bookmark-check" class="w-7 h-7 text-red-600 group-hover:text-white transition-colors"></i>
                            </div>
                            <div>
                                <h3 class="text-lg font-semibold text-gray-800">Marcas</h3>
                                <p class="text-sm text-gray-500">Fabricantes</p>
                            </div>
                        </div>
                        <p class="text-gray-600 text-sm">Administrar marcas de productos.</p>
                    </a>
                    
                </div>
                
               
            </div>
        </main>
    </div>

    <script src="../../../assets/js/jquery.min.js"></script>
    <script src="../../../assets/js/sweetalert2.all.min.js"></script>
    <script src="../../../assets/js/dark-mode-toggle.js"></script>
    <script src="../../../assets/js/responsive-sidebar.js"></script>
    <script>
        $(document).ready(function() {
            lucide.createIcons();
            // Dark mode toggle se inicializa automáticamente en dark-mode-toggle.js
        });
    </script>
</body>
</html>