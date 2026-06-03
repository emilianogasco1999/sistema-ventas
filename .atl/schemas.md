//// =========================================================
//// FORRAJERIA / PET SHOP ERP
//// =========================================================

//// =========================================================
//// ENUMS
//// =========================================================

Enum venta_estado {
pendiente
pagada
cancelada
devuelta
}

Enum caja_sesion_estado {
abierta
cerrada
}

Enum stock_movimiento_tipo {
ingreso
salida
ajuste_positivo
ajuste_negativo
}

Enum caja_movimiento_tipo {
ingreso
egreso
apertura
cierre
ajuste
}

//// =========================================================
//// SUCURSALES
//// =========================================================

Table sucursales {
id int [pk, increment]

nombre varchar [not null]
direccion varchar
telefono varchar
email varchar

activa boolean [default: true]

created_at timestamp [default: `now()`]
}

//// =========================================================
//// USERS
//// =========================================================

Table roles {
id int [pk, increment]

nombre varchar [not null, unique]
created_at timestamp [default: `now()`]
usuario_creador_id int [ref: > usuarios.id]
activo boolean [default: true]
}

Table personas {
id int [pk, increment]

nombre varchar [not null]
apellido varchar [not null]

dni varchar [unique]

telefono varchar
email varchar
}

Table usuarios {
id int [pk, increment]

persona_id int [not null, ref: > personas.id]
sucursal_id int [not null, ref: > sucursales.id]
role_id int [not null, ref: > roles.id]

username varchar [not null, unique]
password varchar [not null]

activo boolean [default: true]
}

//// =========================================================
//// CLIENTES
//// =========================================================

Table clientes {
id int [pk, increment]

persona_id int [not null, ref: > personas.id]

codigo_cliente varchar [unique]

activo boolean [default: true]

created_at timestamp [default: `now()`]
}

//// =========================================================
//// PRODUCTS
//// =========================================================

Table categorias {
id int [pk, increment]

nombre varchar [not null, unique]
}

Table marcas {
id int [pk, increment]

nombre varchar [not null, unique]
}

Table species {
id int [pk, increment]

nombre varchar [not null, unique]
}

Table stages {
id int [pk, increment]

nombre varchar [not null, unique]
}

Table sizes {
id int [pk, increment]

nombre varchar [not null, unique]
}

Table productos {
id int [pk, increment]

categoria_id int [not null, ref: > categorias.id]
marca_id int [not null, ref: > marcas.id]

species_id int [ref: > species.id]
stage_id int [ref: > stages.id]
size_id int [ref: > sizes.id]

nombre varchar [not null]

descripcion text

activo boolean [default: true]

created_at timestamp [default: `now()`]
}

Table producto_variantes {
id int [pk, increment]

producto_id int [not null, ref: > productos.id]

codigo_barra varchar [unique]

peso_kg decimal(10,2)

color varchar

talle varchar

precio_venta decimal(10,2) [not null]

precio_costo decimal(10,2) [not null]

activo boolean [default: true]
}

//// =========================================================
//// INVENTARIOS
//// =========================================================

Table inventarios {
id int [pk, increment]

sucursal_id int [not null, ref: > sucursales.id]

producto_variante_id int [not null, ref: > producto_variantes.id]

stock_actual int [default: 0]

updated_at timestamp [default: `now()`]

Indexes {
(sucursal_id, producto_variante_id) [unique]
}
}

Table stock_movements {
id int [pk, increment]

sucursal_id int [not null, ref: > sucursales.id]

producto_variante_id int [not null, ref: > producto_variantes.id]

tipo stock_movimiento_tipo [not null]

cantidad int [not null]

motivo varchar

usuario_id int [not null, ref: > usuarios.id]

created_at timestamp [default: `now()`]
}

//// =========================================================
//// VENTAS
//// =========================================================

Table ventas {
id int [pk, increment]

sucursal_id int [not null, ref: > sucursales.id]

cliente_id int [ref: > clientes.id]

usuario_id int [not null, ref: > usuarios.id]

subtotal decimal(10,2) [not null]

descuento decimal(10,2) [default: 0]

total decimal(10,2) [not null]

estado venta_estado [default: 'pagada']

numero_ticket varchar [unique]

observaciones text

created_at timestamp [default: `now()`]
}

Table venta_detalles {
id int [pk, increment]

venta_id int [not null, ref: > ventas.id]

producto_variante_id int [not null, ref: > producto_variantes.id]

cantidad int [not null, default: 1]

precio_unitario decimal(10,2) [not null]

subtotal decimal(10,2) [not null]
}

Table metodos_pago {
id int [pk, increment]

nombre varchar [not null, unique]
}

Table venta_pagos {
id int [pk, increment]

venta_id int [not null, ref: > ventas.id]

metodo_pago_id int [not null, ref: > metodos_pago.id]

monto decimal(10,2) [not null]

referencia varchar

created_at timestamp [default: `now()`]
}

//// =========================================================
//// CAJAS
//// =========================================================

Table cajas {
id int [pk, increment]

sucursal_id int [not null, ref: > sucursales.id]

nombre varchar [not null]

activa boolean [default: true]
}

Table caja_sesiones {
id int [pk, increment]

caja_id int [not null, ref: > cajas.id]

usuario_id int [not null, ref: > usuarios.id]

fecha_apertura timestamp [not null]

fecha_cierre timestamp

monto_inicial decimal(10,2) [not null]

monto_cierre decimal(10,2)

estado caja_sesion_estado [default: 'abierta']
}

Table caja_movimientos {
id int [pk, increment]

caja_sesion_id int [not null, ref: > caja_sesiones.id]

tipo caja_movimiento_tipo [not null]

origen varchar

referencia_id int

monto decimal(10,2) [not null]

descripcion text

usuario_id int [not null, ref: > usuarios.id]

created_at timestamp [default: `now()`]
}
