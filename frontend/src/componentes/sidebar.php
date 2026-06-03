<?php

/**
 * Sidebar Component - Forrajería
 * 
 * Navegación lateral reutilizable para todas las páginas.
 * Usa rutas absolutas basadas en la URL actual.
 * 
 * Uso:
 *   require_once __DIR__ . '/../componentes/sidebar.php';
 *   renderSidebar('dashboard', 'Administrador');
 */

// Obtener la ruta base desde la URL actual
function getBaseUrl()
{
    $scriptPath = $_SERVER['SCRIPT_NAME'];

    // Eliminar el nombre del archivo actual
    // Queda: /sistema-ventas/frontend/src/pages  (o /sistema-ventas/frontend/src/pages/config)
    $baseDir = dirname($scriptPath);

    // Siempre devolver /sistema-ventas/frontend/src/pages como base
    // Esto funciona desde cualquier nivel (pages/ o pages/config/)
    return '/sistema-ventas/frontend/src/pages';
}

function getPageUrl($page)
{
    $base = getBaseUrl();

    $pages = [
        'dashboard' => $base . '/dashboard.php',
        'config'    => $base . '/config/index.php',
        'roles'     => $base . '/config/roles.php',
    ];

    return $pages[$page] ?? $base . '/' . $page . '.php';
}

function renderSidebar($activePage = '', $userRole = '')
{
    $dashboardUrl = getPageUrl('dashboard');
    $configUrl = getPageUrl('config');

    $menuItems = [
        [
            'id' => 'dashboard',
            'label' => 'Dashboard',
            'icon' => 'layout-dashboard',
            'href' => $dashboardUrl
        ],
        [
            'id' => 'productos',
            'label' => 'Productos',
            'icon' => 'package',
            'href' => '#'
        ],
        [
            'id' => 'ventas',
            'label' => 'Ventas',
            'icon' => 'shopping-cart',
            'href' => '#'
        ],
        [
            'id' => 'stock',
            'label' => 'Stock',
            'icon' => 'warehouse',
            'href' => '#'
        ],
        [
            'id' => 'clientes',
            'label' => 'Clientes',
            'icon' => 'users',
            'href' => '#'
        ],
        [
            'id' => 'caja',
            'label' => 'Caja',
            'icon' => 'calculator',
            'href' => '#'
        ],
    ];

    $itemsHtml = '';
    foreach ($menuItems as $item) {
        $isActive = ($activePage === $item['id']) ? 'active' : '';

        // Si está activo, usar span en vez de link
        if ($isActive) {
            $itemsHtml .= <<<HTML
            <span class="sidebar-link {$isActive} flex items-center gap-3 px-4 py-3 rounded-lg cursor-default">
                <i data-lucide="{$item['icon']}" class="w-5 h-5"></i>
                <span>{$item['label']}</span>
            </span>
HTML;
        } else {
            $itemsHtml .= <<<HTML
            <a href="{$item['href']}" class="sidebar-link {$isActive} flex items-center gap-3 px-4 py-3 rounded-lg transition-colors">
                <i data-lucide="{$item['icon']}" class="w-5 h-5"></i>
                <span>{$item['label']}</span>
            </a>
HTML;
        }
    }

    // Sección de Configuración (solo para Administradores)
    $configSection = '';
    if ($userRole === 'Administrador') {
        $isActiveConfig = (strpos($activePage, 'config_') === 0) ? 'active' : '';

        // Si está activo, usar span
        if ($isActiveConfig) {
            $configSection = <<<HTML
            <!-- Sección de Configuración -->
            <div class="mt-4 pt-4 border-t border-green-600">
                <p class="text-xs text-green-200 uppercase tracking-wider px-4 mb-2">Configuración</p>
                <nav class="space-y-1">
                    <span class="sidebar-link {$isActiveConfig} flex items-center gap-3 px-4 py-3 rounded-lg cursor-default text-sm">
                        <i data-lucide="settings" class="w-5 h-5"></i>
                        <span>Panel de Configuración</span>
                    </span>
                </nav>
            </div>
HTML;
        } else {
            $configSection = <<<HTML
            <!-- Sección de Configuración -->
            <div class="mt-4 pt-4 border-t border-green-600">
                <p class="text-xs text-green-200 uppercase tracking-wider px-4 mb-2">Configuración</p>
                <nav class="space-y-1">
                    <a href="{$configUrl}" class="sidebar-link {$isActiveConfig} flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm">
                        <i data-lucide="settings" class="w-5 h-5"></i>
                        <span>Panel de Configuración</span>
                    </a>
                </nav>
            </div>
HTML;
        }
    }

    return <<<HTML
        <!-- Overlay para móvil -->
        <div class="sidebar-overlay"></div>
        
        <!-- Sidebar -->
        <aside class="w-64 bg-gradient-to-b from-green-700 to-green-800 text-white flex flex-col sidebar-container">
            <!-- Logo + Botón cerrar (móvil) -->
            <div class="p-6 border-b border-green-600 flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                        <i data-lucide="shopping-bag" class="w-6 h-6 text-green-600"></i>
                    </div>
                    <div>
                        <h1 class="font-bold text-lg">Forrajería</h1>
                        <p class="text-xs text-green-200">Sistema de Gestión</p>
                    </div>
                </div>
                <button class="sidebar-close-btn w-8 h-8 flex items-center justify-center rounded hover:bg-green-600 transition-colors hidden">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            
            <!-- Navegación -->
            <nav class="flex-1 p-4 space-y-1">
                {$itemsHtml}
                {$configSection}
            </nav>
            
            <!-- Footer del sidebar -->
            <div class="p-4 border-t border-green-600">
                <button id="btnLogout" class="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-600 transition-colors">
                    <i data-lucide="log-out" class="w-5 h-5"></i>
                    <span>Cerrar Sesión</span>
                </button>
            </div>
        </aside>
HTML;
}
