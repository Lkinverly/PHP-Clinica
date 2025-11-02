<?php
// Habilitar buffer de salida para controlar cabeceras en respuestas JSON
if (!ob_get_level()) { ob_start(); }
require_once("../app/config/Config.php");
require_once("../app/helpers/Helpers.php");

//Autocarga de las librerias
spl_autoload_register(function($class){
    require_once("../app/libraries/".$class.".php");
});

//Instanciamos la clase Core
$init = new Core;
?>
