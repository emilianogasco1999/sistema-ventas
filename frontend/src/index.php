<?php
/**
 * Index - Redirige al login o al dashboard según el estado de sesión
 */

// Iniciar sesión para verificar
session_start();

if (isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true) {
    // Ya está logueado, ir al dashboard
    header('Location: pages/dashboard.php');
} else {
    // No está logueado, ir al login
    header('Location: pages/login.php');
}
exit;