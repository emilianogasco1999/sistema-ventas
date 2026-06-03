<?php
/**
 * Componente UI: Button
 * 
 * Genera un botón HTML con estilos según variante
 * 
 * @param string $texto Texto del botón
 * @param string $tipo tipo="submit", "button", "reset"
 * @param string $variante verde|rojo|azul|gris|blanco
 * @param string $nombre nombre del botón
 * @param string $icon icono Lucide (sin prefijo)
 * @param string $extra clases adicionales
 * @return string HTML del botón
 */
function Button($texto, $tipo = 'button', $variante = 'azul', $nombre = '', $icon = '', $extra = '') {
    $iconHtml = '';
    if ($icon) {
        $iconHtml = '<i data-lucide="' . $icon . '" class="w-4 h-4 mr-2"></i>';
    }
    
    $colores = [
        'verde' => 'bg-green-600 hover:bg-green-700 text-white',
        'rojo' => 'bg-red-600 hover:bg-red-700 text-white',
        'azul' => 'bg-blue-600 hover:bg-blue-700 text-white',
        'gris' => 'bg-gray-500 hover:bg-gray-600 text-white',
        'blanco' => 'bg-white hover:bg-gray-100 text-gray-800 border border-gray-300',
        'outline' => 'bg-transparent hover:bg-gray-100 text-gray-700 border border-gray-300'
    ];
    
    $clase = $colores[$variante] ?? $colores['azul'];
    $nameAttr = $nombre ? ' name="' . $nombre . '"' : '';
    
    return '<button type="' . $tipo . '"' . $nameAttr . ' class="' . $clase . ' px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center ' . $extra . '">' . 
           $iconHtml . $texto . 
           '</button>';
}

/**
 * Componente UI: Input
 * 
 * Genera un campo de texto con label
 * 
 * @param string $id ID del input
 * @param string $label Texto del label
 * @param string $tipo tipo="text", "email", "password", "number"
 * @param string $placeholder Placeholder
 * @param string $valor Valor actual
 * @param bool $required Si es requerido
 * @param string $extra clases adicionales
 * @return string HTML del input
 */
function Input($id, $label, $tipo = 'text', $placeholder = '', $valor = '', $required = false, $extra = '') {
    $requiredAttr = $required ? ' required' : '';
    $valueAttr = $valor ? ' value="' . htmlspecialchars($valor) . '"' : '';
    
    return '<div class="mb-4">
        <label for="' . $id . '" class="block text-sm font-medium text-gray-700 mb-1">' . $label . '</label>
        <input 
            type="' . $tipo . '" 
            id="' . $id . '" 
            name="' . $id . '" 
            placeholder="' . $placeholder . '"' 
            . $valueAttr . $requiredAttr . '
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ' . $extra . '"
        >
    </div>';
}

/**
 * Componente UI: TarjetaResumen
 * 
 * Genera una tarjeta para el dashboard
 * 
 * @param string $titulo Título de la tarjeta
 * @param string $valor Valor grande
 * @param string $icon icono Lucide
 * @param string $color color del icono
 * @return string HTML de la tarjeta
 */
function TarjetaResumen($titulo, $valor, $icon, $color = 'blue') {
    $colores = [
        'blue' => 'bg-blue-100 text-blue-600',
        'green' => 'bg-green-100 text-green-600',
        'red' => 'bg-red-100 text-red-600',
        'yellow' => 'bg-yellow-100 text-yellow-600',
        'purple' => 'bg-purple-100 text-purple-600'
    ];
    
    $colorClass = $colores[$color] ?? $colores['blue'];
    
    return '<div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-sm text-gray-500 mb-1">' . $titulo . '</p>
                <p class="text-2xl font-bold text-gray-800">' . $valor . '</p>
            </div>
            <div class="w-12 h-12 rounded-full flex items-center justify-center ' . $colorClass . '">
                <i data-lucide="' . $icon . '" class="w-6 h-6"></i>
            </div>
        </div>
    </div>';
}