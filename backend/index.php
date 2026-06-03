<?php
/**
 * Backend - Acceso denegado
 * 
 * No se puede acceder directamente al backend.
 * Usar el frontend para interactuar con el sistema.
 */

// Redirigir al login del frontend
header('Location: ../frontend/src/pages/login.php');
exit;