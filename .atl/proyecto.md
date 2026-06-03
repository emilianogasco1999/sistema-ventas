# Sistema de Gestión para Forrajería

## Objetivo

Desarrollar un sistema de gestión de ventas e inventario para una forrajería utilizando tecnologías tradicionales compatibles con XAMPP, WAMP y hosting compartido (DonWeb, cPanel, Ferozo).

El proyecto debe ser mantenible por dos estudiantes, evitando frameworks modernos complejos y utilizando una arquitectura simple, modular y funcional.

---

# Restricciones Técnicas

## Tecnologías Permitidas

### Backend

* PHP nativo
* MySQL
* PDO
* Composer (solo para librerías específicas)

### Frontend

* PHP
* HTML
* Tailwind CSS (local)
* jQuery (local)
* SweetAlert2 (local)
* Lucide Icons (local)

---

## Tecnologías Prohibidas

* React
* Next.js
* Node.js
* TypeScript
* Prisma
* Shadcn/UI
* Laravel
* Symfony
* NestJS
* Arquitecturas complejas basadas en clases

---

# Modalidad de Despliegue

El sistema debe funcionar tanto en:

* XAMPP
* WAMP
* Hosting compartido tradicional

Por lo tanto:

* Utilizar rutas relativas.
* No asumir dominios fijos.
* No depender de CDNs.
* Todas las librerías deben cargarse desde `assets/`.

---

# Arquitectura General

```text
sistema-ventas/
│
├── backend/
│   ├── config/
│   │   └── database.php
│   │
│   ├── controllers/
│   │   ├── producto.php
│   │   └── venta.php
│   │
│   ├── models/
│   │   ├── producto.php
│   │   └── venta.php
│   │
│   ├── vendor/
│   │
│   ├── api.php
│   └── composer.json
│
└── frontend/
    ├── assets/
    │   ├── css/
    │   │   └── tailwind.min.css
    │   │
    │   └── js/
    │       ├── jquery.min.js
    │       ├── sweetalert2.all.min.js
    │       └── lucide.min.js
    │
    └── src/
        ├── componentes/
        │   ├── header.php
        │   ├── navbar.php
        │   ├── footer.php
        │   │
        │   └── ui/
        │       ├── index.php
        │       ├── Button.php
        │       ├── Input.php
        │       └── TarjetaResumen.php
        │
        ├── js/
        │   ├── productos.js
        │   └── ventas.js
        │
        ├── pages/
        │   ├── productos.php
        │   └── ventas.php
        │
        └── index.php
```

---

# Arquitectura Backend

## Patrón MVC Funcional

No se utilizan clases.

Todo se organiza mediante funciones.

### Config

Responsable de devolver la conexión PDO.

```php
$db = obtenerConexion();
```

---

### Models

Contienen SQL puro.

Ejemplos:

```php
dbListarProductos()
dbGuardarProducto()
dbActualizarProducto()
dbEliminarProducto()
```

Responsabilidades:

* SELECT
* INSERT
* UPDATE
* DELETE

No validan datos.

---

### Controllers

Contienen reglas de negocio.

Ejemplos:

```php
ctrlListarProductos()
ctrlGuardarProducto()
```

Responsabilidades:

* Leer $_POST
* Leer $_GET
* Validar
* Llamar al modelo
* Responder JSON

---

### API

Punto único de entrada.

```php
backend/api.php
```

Recibe:

```javascript
$.get()
$.post()
```

Y distribuye mediante:

```php
switch($accion)
```

---

# Reglas Backend

## Conexión Única

La conexión PDO se abre una sola vez.

```php
$db = obtenerConexion();
```

---

## Respuestas JSON

Todas las respuestas deben ser JSON.

```php
echo json_encode($respuesta);
exit;
```

---

## Sin Clases

No utilizar:

```php
class Producto {}
```

Todo debe ser funcional.

---

# Arquitectura Frontend

## Vistas PHP

Cada pantalla utiliza:

```php
include 'componentes/header.php';
include 'componentes/navbar.php';
include 'componentes/footer.php';
```

---

## Componentes UI

Se construyen como funciones PHP.

Ejemplo:

```php
Button()
Input()
TarjetaResumen()
```

Cada componente devuelve HTML.

Ejemplo:

```php
echo Button("Guardar", "submit", "verde", "save");
```

---

# JavaScript

Toda la interacción utiliza jQuery.

Permitido:

```javascript
$.get()
$.post()
$("#id")
$(".clase")
```

Evitar JavaScript Vanilla complejo.

---

# SweetAlert2

Se utiliza para:

* Éxitos
* Errores
* Confirmaciones
* Toasts

Ejemplo:

```javascript
Swal.fire({
    icon: 'success',
    title: 'Guardado'
});
```

---

# Lucide Icons

Todos los íconos son locales.

```html
<i data-lucide="shopping-cart"></i>
```

Inicialización:

```javascript
lucide.createIcons();
```

---

# Regla Crítica de Lucide

Cada vez que jQuery agregue HTML dinámico:

```javascript
$("#tabla").append(html);
```

Se debe ejecutar:

```javascript
lucide.createIcons();
```

para que los nuevos íconos se rendericen.

---

# Formularios

Utilizar:

```javascript
$(this).serialize();
```

o

```javascript
new FormData(this);
```

para capturar automáticamente los campos.

Ejemplo:

```javascript
const datos =
    $(this).serialize() +
    "&accion=guardar_producto";
```

---

# Módulos Iniciales

## Dashboard

Indicadores generales:

* Ventas del día
* Productos con poco stock
* Total de productos

---

## Stock

Gestión de:

* Altas
* Modificaciones
* Bajas
* Control de stock

---

## Ventas

Caja registradora:

* Carrito
* Registro de ventas
* Facturación
* Impresión de tickets

---

# Rol de ChatGPT

Actuar como:

* Arquitecto de Software Senior
* Tutor Técnico
* Revisor de Código
* Consultor PHP + MySQL + jQuery

Respetando siempre:

* MVC funcional
* PHP procedural
* jQuery
* Tailwind local
* SweetAlert2 local
* Lucide local

Sin introducir tecnologías fuera del stack definido.
