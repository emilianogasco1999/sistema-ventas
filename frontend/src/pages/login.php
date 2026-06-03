<?php
$title = $title ?? 'Login';
$error = $error ?? '';
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($title) ?> - Forrajería</title>
    <link rel="stylesheet" href="../../assets/css/tailwind.min.css">
    <link rel="stylesheet" href="../../assets/css/dark-mode.css">
    <link rel="stylesheet" href="../../assets/css/login.css">
    <script src="../../assets/js/lucide.min.js"></script>
</head>
<body class="flex items-center justify-center p-4 login-page">
    
    <div class="login-card w-full max-w-md" style="position: relative;">
        <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
            <!-- Header con icono -->
            <div class="bg-gradient-to-r from-green-600 to-green-700 p-6 text-center">
                <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3">
                    <i data-lucide="shopping-bag" class="w-8 h-8 text-green-600 "></i>
                </div>
                <h1 class="text-2xl font-bold text-white">Forrajería</h1>
                <p class="text-green-100 text-sm mt-1">Sistema de Gestión</p>
            </div>
            
            <!-- Formulario -->
            <div class="p-6">
                <form id="loginForm" novalidate class="space-y-4">
                    <!-- Campo Usuario -->
                    <div class="form-group">
                        <label for="username" class="block text-sm font-medium text-gray-700 mb-1">
                            Usuario
                        </label>
                        <input 
                            type="text" 
                            id="username" 
                            name="username" 
                            placeholder="Ingresá tu usuario"
                            autocomplete="username"
                            data-rules="required"
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                        >
                    </div>
                    
                    <!-- Campo Contraseña -->
                    <div class="form-group">
                        <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
                            Contraseña
                        </label>
                        <input 
                            type="password" 
                            id="password" 
                            name="password" 
                            placeholder="Ingresá tu contraseña"
                            autocomplete="current-password"
                            data-rules="required|minLength:4"
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                        >
                    </div>
                    
                    <button 
                        type="submit"
                        id="btnLogin"
                        class="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        <span id="btnLoginText">Iniciar Sesión</span>
                        <i data-lucide="log-in" class="w-5 h-5" id="btnLoginIcon"></i>
                    </button>
                </form>
                
                <!-- Mensaje de error del servidor -->
                <div id="serverError" class="hidden mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center">
                </div>
            </div>
        </div>
        
        <!-- Footer -->
        <p class="text-center text-gray-500 text-sm mt-4">
            &copy; <?= date('Y') ?> Forrajería - Todos los derechos reservados
        </p>
    </div>

    <script src="../../assets/js/jquery.min.js"></script>
    <script src="../../assets/js/sweetalert2.all.min.js"></script>
    <script src="../../assets/js/dark-mode-toggle.js"></script>
    <script src="../js/validation.js"></script>
    <script src="../js/login.js"></script>
</body>
</html>