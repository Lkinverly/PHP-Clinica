export function translateToEnglish (spanishModule){
    const module = {
        'inicio': 'home',
        'usuario': 'user',
        'rol': 'role',
        'paciente': 'patient',
        'diagnostico': 'diagnosis',
        'diagnosticos': 'diagnosticos',
        'habitacion': 'room',
        'empleado': 'employee',
        'posicion': 'position',
        'medicina': 'medicine',
        'proveedor': 'supplier',
        'lote': 'batch',
        'sucursal': 'branch',
        'venta': 'sale',
        'examen': 'exam',
        'habitaciondisponible': 'roomAvailable',
        'historialhabitacion': 'roomHistory'
    };

    return module[spanishModule] || spanishModule;
}
