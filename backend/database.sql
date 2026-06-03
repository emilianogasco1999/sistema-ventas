-- =========================================================
-- FORRAJERIA ERP - Schema de Base de Datos
-- =========================================================

CREATE DATABASE IF NOT EXISTS forrajeria
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE forrajeria;

-- =========================================================
-- TABLAS BASE
-- =========================================================

-- Sucursales
CREATE TABLE IF NOT EXISTS sucursales (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    direccion VARCHAR(255),
    telefono VARCHAR(20),
    email VARCHAR(100),
    activa BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Roles
CREATE TABLE IF NOT EXISTS roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_creador_id INT NULL,
    activo BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Personas
CREATE TABLE IF NOT EXISTS personas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    dni VARCHAR(20) UNIQUE,
    telefono VARCHAR(20),
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    persona_id INT NOT NULL,
    sucursal_id INT NOT NULL,
    role_id INT NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (persona_id) REFERENCES personas(id),
    FOREIGN KEY (sucursal_id) REFERENCES sucursales(id),
    FOREIGN KEY (role_id) REFERENCES roles(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Clientes
CREATE TABLE IF NOT EXISTS clientes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    persona_id INT NOT NULL,
    codigo_cliente VARCHAR(20) UNIQUE,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (persona_id) REFERENCES personas(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================================
-- CATÁLOGOS DE PRODUCTOS
-- =========================================================

-- Categorías
CREATE TABLE IF NOT EXISTS categorias (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Marcas
CREATE TABLE IF NOT EXISTS marcas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Species (especies animales)
CREATE TABLE IF NOT EXISTS species (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Stages (etapas de vida: cachorro, adulto, senior)
CREATE TABLE IF NOT EXISTS stages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Sizes (tamaños)
CREATE TABLE IF NOT EXISTS sizes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Productos
CREATE TABLE IF NOT EXISTS productos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    categoria_id INT NOT NULL,
    marca_id INT NOT NULL,
    species_id INT,
    stage_id INT,
    size_id INT,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id),
    FOREIGN KEY (marca_id) REFERENCES marcas(id),
    FOREIGN KEY (species_id) REFERENCES species(id),
    FOREIGN KEY (stage_id) REFERENCES stages(id),
    FOREIGN KEY (size_id) REFERENCES sizes(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Variantes de productos
CREATE TABLE IF NOT EXISTS producto_variantes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    producto_id INT NOT NULL,
    codigo_barra VARCHAR(50) UNIQUE,
    peso_kg DECIMAL(10,2),
    color VARCHAR(50),
    talle VARCHAR(20),
    precio_venta DECIMAL(10,2) NOT NULL,
    precio_costo DECIMAL(10,2) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (producto_id) REFERENCES productos(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================================
-- INVENTARIO
-- =========================================================

-- Inventarios por sucursal
CREATE TABLE IF NOT EXISTS inventarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sucursal_id INT NOT NULL,
    producto_variante_id INT NOT NULL,
    stock_actual INT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_sucursal_variante (sucursal_id, producto_variante_id),
    FOREIGN KEY (sucursal_id) REFERENCES sucursales(id),
    FOREIGN KEY (producto_variante_id) REFERENCES producto_variantes(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Movimientos de stock
CREATE TABLE IF NOT EXISTS stock_movements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sucursal_id INT NOT NULL,
    producto_variante_id INT NOT NULL,
    tipo ENUM('ingreso', 'salida', 'ajuste_positivo', 'ajuste_negativo') NOT NULL,
    cantidad INT NOT NULL,
    motivo VARCHAR(255),
    usuario_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sucursal_id) REFERENCES sucursales(id),
    FOREIGN KEY (producto_variante_id) REFERENCES producto_variantes(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================================
-- VENTAS
-- =========================================================

-- Ventas
CREATE TABLE IF NOT EXISTS ventas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sucursal_id INT NOT NULL,
    cliente_id INT,
    usuario_id INT NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    descuento DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    estado ENUM('pendiente', 'pagada', 'cancelada', 'devuelta') DEFAULT 'pagada',
    numero_ticket VARCHAR(20) UNIQUE,
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sucursal_id) REFERENCES sucursales(id),
    FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Detalles de venta
CREATE TABLE IF NOT EXISTS venta_detalles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    venta_id INT NOT NULL,
    producto_variante_id INT NOT NULL,
    cantidad INT NOT NULL DEFAULT 1,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (venta_id) REFERENCES ventas(id),
    FOREIGN KEY (producto_variante_id) REFERENCES producto_variantes(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Métodos de pago
CREATE TABLE IF NOT EXISTS metodos_pago (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Pagos de venta
CREATE TABLE IF NOT EXISTS venta_pagos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    venta_id INT NOT NULL,
    metodo_pago_id INT NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    referencia VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (venta_id) REFERENCES ventas(id),
    FOREIGN KEY (metodo_pago_id) REFERENCES metodos_pago(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================================
-- CAJA
-- =========================================================

-- Cajas
CREATE TABLE IF NOT EXISTS cajas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sucursal_id INT NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    activa BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (sucursal_id) REFERENCES sucursales(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Sesiones de caja
CREATE TABLE IF NOT EXISTS caja_sesiones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    caja_id INT NOT NULL,
    usuario_id INT NOT NULL,
    fecha_apertura TIMESTAMP NOT NULL,
    fecha_cierre TIMESTAMP,
    monto_inicial DECIMAL(10,2) NOT NULL,
    monto_cierre DECIMAL(10,2),
    estado ENUM('abierta', 'cerrada') DEFAULT 'abierta',
    FOREIGN KEY (caja_id) REFERENCES cajas(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Movimientos de caja
CREATE TABLE IF NOT EXISTS caja_movimientos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    caja_sesion_id INT NOT NULL,
    tipo ENUM('ingreso', 'egreso', 'apertura', 'cierre', 'ajuste') NOT NULL,
    origen VARCHAR(50),
    referencia_id INT,
    monto DECIMAL(10,2) NOT NULL,
    descripcion TEXT,
    usuario_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (caja_sesion_id) REFERENCES caja_sesiones(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================================
-- DATOS INICIALES
-- =========================================================

-- Roles
INSERT IGNORE INTO roles (nombre) VALUES 
('Administrador'),
('Vendedor'),
('Encargado');

-- Sucursal por defecto
INSERT IGNORE INTO sucursales (nombre, direccion, telefono, email) VALUES 
('Sucursal Principal', 'Av. Libertador 1234', '261-555-1234', 'ventas@forrajeria.com');

-- Persona admin
INSERT IGNORE INTO personas (nombre, apellido, dni, telefono) VALUES 
('Admin', 'Sistema', '12345678', '261-555-1000');

-- Usuario admin (password: admin123)
-- La contraseña se hashea con bcrypt
INSERT IGNORE INTO usuarios (persona_id, sucursal_id, role_id, username, password) VALUES 
(1, 1, 1, 'admin', '$2y$10$3iGNI9Om5QgtUacvVMjGxuRPMG/7Mk0M7wXRS3wWVMvD5HwMNHqga');

-- Métodos de pago
INSERT IGNORE INTO metodos_pago (nombre) VALUES 
('Efectivo'),
('Débito'),
('Crédito'),
('Mercado Pago'),
('Transferencia');

-- Categorías
INSERT IGNORE INTO categorias (nombre) VALUES 
('Alimentos'),
('Accesorios'),
('Juguetes'),
('Medicamentos'),
('Limpieza'),
('Correas y Collares');

-- Marcas
INSERT IGNORE INTO marcas (nombre) VALUES 
('Royal Canin'),
('Purina'),
('Whiskas'),
('Pedigree'),
('Eukanuba'),
('Varios');

-- Species
INSERT IGNORE INTO species (nombre) VALUES 
('Perro'),
('Gato'),
('Pez'),
('Pájaro'),
('Roedor'),
('Reptil');

-- Stages
INSERT IGNORE INTO stages (nombre) VALUES 
('Cachorro'),
('Adulto'),
('Senior');

-- Sizes
INSERT IGNORE INTO sizes (nombre) VALUES 
('Pequeño'),
('Mediano'),
('Grande'),
('Gigante');

-- Restricciones adicionales post-creación
ALTER TABLE roles 
ADD CONSTRAINT fk_roles_usuario_creador
FOREIGN KEY (usuario_creador_id) REFERENCES usuarios(id);