# Sistema de Ventas - Forrajería ERP

Sistema de gestión de ventas y stock para forrajería, desarrollado con arquitectura PHP + MySQL.

---

## Tecnologias

| Capa              | Tecnologia             | Version      |
| ----------------- | ---------------------- | ------------ |
| **Backend**       | PHP                    | 8.x+         |
| **Base de Datos** | MySQL                  | 8.x+ (XAMPP) |
| **Frontend**      | HTML5 + CSS3           | -            |
| **JavaScript**    | Vanilla JS + jQuery    | 3.x          |
| **Iconos**        | Lucide Icons           | -            |
| **Alertas**       | SweetAlert2            | -            |
| **Conexión BD**   | PDO (PHP Data Objects) | -            |

---

## Estructura del Proyecto

```
sistema-ventas/
├── backend/
│   ├── api.php              # Punto de entrada API
│   ├── config/
│   │   └── database.php     # Configuración de conexión
│   ├── controllers/
│   │   ├── auth.php         # Controlador de autenticación
│   │   └── dashboard.php    # Controlador del dashboard
│   ├── models/
│   │   └── usuario.php      # Modelo de usuarios
│   └── database.sql         # Schema de base de datos
├── frontend/
│   ├── assets/
│   │   └── js/
│   │       ├── jquery.min.js
│   │       ├── lucide.min.js
│   │       └── sweetalert2.all.min.js
│   └── src/
│       ├── index.php        # Redirección login/dashboard
│       ├── componentes/
│       │   └── ui/
│       │       └── index.php
│       └── pages/
│           ├── login.php    # Página de login
│           └── dashboard.php
└── README.md
```

---

## Requisitos

- **XAMPP** (o WAMP/MAMP) con:
  - Apache
  - MySQL
  - PHP 8.x+
- Navegador web moderno (Chrome, Firefox, Edge)

---

## Instalación

### 1. Configurar Base de Datos

1. Abrir phpMyAdmin (`http://localhost/phpmyadmin`)
2. Importar el archivo `backend/database.sql`

### 2. Credenciales de Acceso

| Usuario | Contraseña | Rol           |
| ------- | ---------- | ------------- |
| `admin` | `admin123` | Administrador |

### 3. Acceder al Sistema

1. Asegurate de que Apache y MySQL estén corriendo en XAMPP
2. Abrir en el navegador: `http://localhost/sistema-ventas/frontend/src/`
3. Iniciar sesión con las credenciales de arriba

---

## Configuración

### Base de Datos

Editar `backend/config/database.php`:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'forrajeria');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_CHARSET', 'utf8mb4');
```

### Cambiar Contraseña del Admin

La contraseña se hashea con **bcrypt**. Para cambiarla, ejecutar en phpMyAdmin:

```sql
UPDATE usuarios
SET password = '$2y$10$TU_HASH_Bcrypt'
WHERE username = 'admin';
```

O crear una nueva desde el sistema una vez logueado.

---

## Módulos

- [ ] Login / Logout
- [x] Dashboard con estadísticas
- [ ] Gestión de Usuarios
- [ ] Gestión de Productos
- [ ] Gestión de Stock
- [ ] Punto de Venta (POS)
- [ ] Gestión de Cajas
- [ ] Reportes

---

## API Endpoints

| Acción             | Descripción                |
| ------------------ | -------------------------- |
| `login`            | Autenticación de usuario   |
| `logout`           | Cerrar sesión              |
| `verificar_sesion` | Verificar estado de sesión |
| `dashboard_stats`  | Estadísticas del dashboard |

---

## Licencia

Proyecto en desarrollo.
