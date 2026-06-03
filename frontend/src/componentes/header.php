<?php
/**
 * Header Component - Forrajería
 * 
 * Header de página reutilizable con título, usuario y controles.
 * El botón de dark mode se renderiza directamente (no por JS).
 * 
 * Uso:
 *   require_once __DIR__ . '/../componentes/header.php';
 *   renderHeader('Dashboard', 'Resumen de actividad', 'admin');
 */

function renderHeader($title = 'Dashboard', $subtitle = '', $userName = '', $userRole = '') {
    // Verificar si dark mode está activo
    $isDark = isset($_COOKIE['darkMode']) && $_COOKIE['darkMode'] === '1';
    $darkClass = $isDark ? 'dark' : '';
    $sunDisplay = $isDark ? 'block' : 'none';
    $moonDisplay = $isDark ? 'none' : 'block';
    
    return <<<HTML
        <!-- Header -->
        <header class="bg-white shadow-sm border-b border-gray-200 px-4 md:px-6 py-4 dashboard-header">
            <div class="flex items-center justify-between">
                <!-- Izquierda: Menú + Título -->
                <div class="flex items-center gap-3">
                    <!-- Botón hamburguesa (visible en móvil) -->
                    <button class="menu-toggle-btn" aria-label="Abrir menú">
                        <i data-lucide="menu" class="w-6 h-6"></i>
                    </button>
                    <div>
                        <h2 class="text-lg md:text-xl font-semibold text-gray-800 dark:text-gray-100">{$title}</h2>
                        <p class="text-xs md:text-sm text-gray-500 dark:text-gray-400 hidden sm:block">{$subtitle}</p>
                    </div>
                </div>
                
                <!-- Derecha: Dark mode + Usuario -->
                <div class="flex items-center gap-2 md:gap-4">
                    <!-- Botón Dark Mode (renderizado en PHP) -->
                    <button id="btnDarkMode" class="dark-toggle-btn" aria-label="Cambiar modo">
                        <i data-lucide="sun" class="icon-sun" style="display: {$sunDisplay}"></i>
                        <i data-lucide="moon" class="icon-moon" style="display: {$moonDisplay}"></i>
                    </button>
                    
                    <div class="text-right hidden sm:block">
                        <p class="text-sm font-medium text-gray-800 dark:text-gray-100" id="userName">{$userName}</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400" id="userRole">{$userRole}</p>
                    </div>
                    <div class="w-9 h-9 md:w-10 md:h-10 bg-green-100 dark:bg-gray-700 rounded-full flex items-center justify-center user-avatar">
                        <i data-lucide="user" class="w-4 h-4 md:w-5 md:h-5 text-green-600 dark:text-gray-300"></i>
                    </div>
                </div>
            </div>
        </header>
HTML;
}