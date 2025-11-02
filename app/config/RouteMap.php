<?php
//Rutas de controladores de español a inglés
const ROUTE_MAP = [
    "login" => "LoginController",
    "inicio" => "HomeController",
    "usuario" => "UserController",
    "rol" => "RoleController",
    "permiso" => "PermissionController",
    "paciente" => "PatientController",
    "empleado" => "EmployeeController",
    "posicion" => "PositionController",
    "lote" => "BatchController",
    "medicina" => "MedicineController",
    "proveedor" => "SupplierController",
    "sucursal" => "BranchController",
    "inventario" => "InventoryController",
    "habitacion" => "RoomController",
    "diagnostico" => "PatientDiagnosisController",
    "pacientehabitacion" => "RoomAssignmentController",
    "venta" => "SaleController",
    "ventadetalle" => "SaleDetailController",
    "examen" => "ExamController",
    "pacienteexamen" => "PatientExamController",
    "habitaciondisponible" => "RoomAvailableController",
    "historialhabitacion"  => "RoomHistoryController",
];

//Rutas de métodos de español a inglés
const ROUTE_METHOD_MAP = [
    "ingresar" => "login",
    "salir" => "logout",
    "token" => "token",
    "noticias" => "news",
    "actualizar" => "update",
    "eliminar" => "delete",
    "agregar" => "insert",
    "buscar" => "search",
    "mostrar" => "show",
    "filtrar" => "filter"
];
?>
