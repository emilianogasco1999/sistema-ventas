<?php
/**
 * Gestión de Roles - Forrajería
 * 
 * Módulo para listar y crear nuevos roles en el sistema.
 * Solo accesible para Administradores.
 */

// Iniciar sesión y verificar autenticación
session_start();

if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    header('Location: ../login.php');
    exit;
}

$userRole = $_SESSION['usuario_rol'] ?? '';
$userName = $_SESSION['usuario_nombre'] ?? '';

// Restringir acceso solo a Administradores
if ($userRole !== 'Administrador') {
    header('Location: ../dashboard.php');
    exit;
}

// Cargar componentes
require_once __DIR__ . '/../../componentes/sidebar.php';
require_once __DIR__ . '/../../componentes/header.php';
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Roles - Forrajería</title>
    <!-- Assets locales -->
    <link rel="stylesheet" href="../../../assets/css/tailwind.min.css">
    <link rel="stylesheet" href="../../../assets/css/dark-mode.css">
    <link rel="stylesheet" href="../../../assets/css/dashboard.css">
    <link rel="stylesheet" href="../../../assets/css/responsive.css">
    <script src="../../../assets/js/lucide.min.js"></script>
    <style>
        /* Estilos específicos para validación */
        .is-invalid {
            border-color: #ef4444 !important;
        }
        .error-message {
            color: #ef4444;
            font-size: 0.875rem;
            margin-top: 0.25rem;
        }
        /* Forzar color de texto oscuro en inputs con fondo blanco en modo oscuro */
        body.dark input:not([type="submit"]):not([type="button"]),
        body.dark select,
        body.dark textarea {
            color: #111827 !important;
        }
        /* Color de fondo para filas de tabla al pasar el mouse en modo oscuro */
        body.dark tr:hover {
            background-color: #374151 !important;
        }
    </style>
</head>
<body class="bg-gray-100">
    <div class="flex min-h-screen dashboard-layout">
        <!-- Sidebar -->
        <?= renderSidebar('config_roles', $userRole); ?>
        
        <!-- Contenido principal -->
        <main class="flex-1 flex flex-col">
            <!-- Header -->
            <?= renderHeader('Roles', 'Gestión de roles y permisos de acceso', $userName, $userRole); ?>
            
            <!-- Contenido -->
            <div class="flex-1 p-6 overflow-auto">
                
                <!-- Enlace de regreso al panel -->
                <div class="mb-6">
                    <a href="index.php" class="flex items-center gap-2 text-green-700 hover:text-green-800 font-medium text-sm transition-colors w-fit">
                        <i data-lucide="arrow-left" class="w-4 h-4"></i>
                        Volver al Panel de Configuración
                    </a>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    <!-- Formulario de creación de rol -->
                    <div class="lg:col-span-1 bg-white rounded-xl shadow-sm p-6 border border-gray-100 h-fit">
                        <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <i data-lucide="plus-circle" class="w-5 h-5 text-green-600"></i>
                            Crear Nuevo Rol
                        </h3>
                        
                        <form id="formRol" novalidate>
                            <div class="mb-4 form-group">
                                <label for="nombre" class="block text-sm font-medium text-gray-700 mb-1">Nombre del Rol *</label>
                                <input type="text" 
                                       name="nombre" 
                                       id="nombre" 
                                       placeholder="Ej. Supervisor, Auditor" 
                                       class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                                       data-rules="required|minLength:3|maxLength:50">
                            </div>
                            
                            <button type="submit" class="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                                <i data-lucide="save" class="w-5 h-5"></i>
                                Guardar Rol
                            </button>
                        </form>
                    </div>
                    
                    <!-- Listado de roles -->
                    <div class="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <i data-lucide="shield" class="w-5 h-5 text-green-600"></i>
                            Roles Registrados
                        </h3>
                        
                        <div class="overflow-x-auto">
                            <table class="w-full text-left border-collapse">
                                <thead>
                                    <tr class="border-b border-gray-200 text-gray-500 text-sm">
                                        <th class="py-3 px-4 font-semibold">Nombre</th>
                                        <th class="py-3 px-4 font-semibold">Estado</th>
                                        <th class="py-3 px-4 font-semibold">Creado Por</th>
                                        <th class="py-3 px-4 font-semibold">Fecha de Creación</th>
                                        <th class="py-3 px-4 font-semibold text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody id="tablaRoles" class="divide-y divide-gray-100 text-sm text-gray-700">
                                    <tr>
                                        <td colspan="5" class="py-6 text-center text-gray-500">
                                            <div class="flex flex-col items-center gap-2">
                                                <i data-lucide="loader-2" class="w-6 h-6 animate-spin text-green-600"></i>
                                                Cargando roles...
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                </div>
            </div>
        </main>
    </div>

    <!-- Scripts locales -->
    <script src="../../../assets/js/jquery.min.js"></script>
    <script src="../../../assets/js/sweetalert2.all.min.js"></script>
    <script src="../../../assets/js/dark-mode-toggle.js"></script>
    <script src="../../../assets/js/responsive-sidebar.js"></script>
    <script src="../../js/validation.js"></script>
    <script src="../../js/roles.js"></script>
</body>
</html>
