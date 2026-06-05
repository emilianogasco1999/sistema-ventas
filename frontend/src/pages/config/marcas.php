<?php
/**
 * Gestión de Marcas - Forrajería
 * 
 * Módulo para listar y crear nuevas marcas de productos.
 * Accesible para Administradores, Super Admins y Encargados.
 */

// Iniciar sesión y verificar autenticación
session_start();

if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    header('Location: ../login.php');
    exit;
}

$userRole = $_SESSION['usuario_rol'] ?? '';
$userName = $_SESSION['usuario_nombre'] ?? '';

// Restringir acceso solo a Administradores, Super Admins y Encargados
if ($userRole !== 'Administrador' && $userRole !== 'Super Admin' && $userRole !== 'Encargado') {
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
    <title>Marcas - Forrajería</title>
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
        /* Indicador de orden activa */
        th.sortable .sort-icon {
            opacity: 0.3;
            transition: opacity 0.2s;
        }
        th.sortable.asc .sort-icon,
        th.sortable.desc .sort-icon {
            opacity: 1;
        }
        th { cursor: pointer; user-select: none; }
        th.sortable:hover .sort-icon { opacity: 0.7; }
        /* Spinner de búsqueda */
        .search-spinner { display: none; }
        .searching .search-spinner { display: inline-block; }
    </style>
</head>
<body class="bg-gray-100">
    <div class="flex min-h-screen dashboard-layout">
        <!-- Sidebar -->
        <?= renderSidebar('config_marcas', $userRole); ?>
        
        <!-- Contenido principal -->
        <main class="flex-1 flex flex-col">
            <!-- Header -->
            <?= renderHeader('Marcas', 'Gestión de fabricantes y marcas de productos', $userName, $userRole); ?>
            
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
                    
                    <!-- Formulario de marcas -->
                    <div class="lg:col-span-1 bg-white rounded-xl shadow-sm p-6 border border-gray-100 h-fit">
                        <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <i data-lucide="plus-circle" class="w-5 h-5 text-green-600"></i>
                            Crear Nueva Marca
                        </h3>
                        
                        <form id="formMarca" novalidate>
                            <div class="mb-4 form-group">
                                <label for="nombre" class="block text-sm font-medium text-gray-700 mb-1">Nombre de la Marca *</label>
                                <input type="text" 
                                       name="nombre" 
                                       id="nombre" 
                                       placeholder="Ej. Purina, Royal Canin" 
                                       class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                                       data-rules="required|minLength:2|maxLength:100">
                            </div>
                            
                            <button type="submit" class="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                                <i data-lucide="save" class="w-5 h-5"></i>
                                Guardar Marca
                            </button>
                        </form>
                    </div>
                    
                    <!-- Listado de marcas -->
                    <div class="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <i data-lucide="bookmark" class="w-5 h-5 text-green-600"></i>
                            Marcas Registradas
                        </h3>
                        
                        <!-- Controles: búsqueda -->
                        <div class="flex flex-wrap items-center gap-3 mb-4">
                            <!-- Búsqueda -->
                            <div class="relative flex-1 min-w-[200px] max-w-xs">
                                <i data-lucide="search" class="absolute left-3 top-3 -translate-y-1/2 w-4 h-4 text-gray-400"></i>
                                <input type="text" 
                                       id="searchInput" 
                                       placeholder="Buscar por nombre..." 
                                       class="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm">
                                <i data-lucide="loader-2" class="absolute right-3 top-3 -translate-y-1/2 w-4 h-4 text-gray-400 search-spinner animate-spin"></i>
                            </div>
                        </div>
                        
                        <div class="overflow-x-auto">
                            <table class="w-full text-left border-collapse">
                                <thead>
                                    <tr class="border-b border-gray-200 text-gray-500 text-sm">
                                        <th class="py-3 px-4 font-semibold sortable" data-sort="nombre" id="thNombre">
                                            <span class="flex items-center gap-1">
                                                Nombre
                                                <span class="sort-icon">
                                                    <i data-lucide="chevrons-up-down" class="w-4 h-4"></i>
                                                </span>
                                            </span>
                                        </th>
                                        <th class="py-3 px-4 font-semibold text-center w-24">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody id="tablaMarcas" class="divide-y divide-gray-100 text-sm text-gray-700">
                                    <tr>
                                        <td colspan="2" class="py-6 text-center text-gray-500">
                                            <div class="flex flex-col items-center gap-2">
                                                <i data-lucide="loader-2" class="w-6 h-6 animate-spin text-green-600"></i>
                                                Cargando marcas...
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        
                        <!-- Paginación -->
                        <div id="paginationControls" class="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                            <div class="text-sm text-gray-500">
                                <span id="infoRegistros">Mostrando 0 registros</span>
                            </div>
                            <div id="paginas" class="flex items-center gap-1">
                                <!-- Botones de paginación se generan dinámicamente -->
                            </div>
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
    <script src="../../js/marcas.js"></script>
</body>
</html>
