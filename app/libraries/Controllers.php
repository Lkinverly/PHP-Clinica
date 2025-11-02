<?php
//Clase controlador que se encarga de cargar los módelos y las vistas
class Controllers{
    protected $model;
    protected $authMiddleware;

    public function __construct(){
        $this->model();
        $this->authMiddleware();
    }

    //Cargar módelo
    protected function model(){
        $model = get_class($this);
        $model = str_replace("Controller","Model", $model);
        $routClassModel = "../app/Models/".$model.".php";
        
        if(file_exists($routClassModel)){
            require_once($routClassModel);
            $this->model = new $model;
        }
    }

    protected function authMiddleware(){
        $routClass = "../app/middleware/AuthMiddleware.php";
        if(file_exists($routClass)){
            require_once($routClass);
            $this->authMiddleware = new AuthMiddleware;
        }
    }

    //Cargar vista
    protected function view($view, $data = []){
        require_once("../app/Views/".$view.".php");
    }

     // Respuesta en formato JSON
     protected function jsonResponse($data) {
        // Limpiar cualquier salida previa para asegurar cabeceras correctas
        if (ob_get_length()) {
            while (ob_get_level() > 0) { ob_end_clean(); }
        }
        if (!headers_sent()) {
            header('Content-Type: application/json; charset=utf-8');
        }
        echo json_encode($data);
        exit;
    }

    protected function getUserAndModules($data) {
        if (empty($data['user']) || empty($data['modules'])) {
            return $data; // O maneja el error de alguna otra manera
        }
    
        $user = $data['user'];
        $moduleData = array_map(function($module) {
            return [
                'module' => $module->module,
                'link' => $module->link,
                'icon' => $module->icon,
                'show_operation' => $module->show_operation,
                'create_operation' => $module->create_operation,
                'update_operation' => $module->update_operation,
                'delete_operation' => $module->delete_operation,
                'cud_operation' => $module->cud_operation
            ];
        }, $data['modules']);
    
        return [
            'user_id' => $user->user_id,
            'role_id' => $user->role_id,
            'first_name' => $user->first_name,
            'user_name' => $user->user_name,
            'role_name' => $user->role_name,
            'branch_name' => $user->branch_name,
            'modules' => $moduleData
        ];
    }
    

    // Destructor para cerrar la conexión
    public function __destruct() {
        if(isset($this->model)) {
            $this->model->closeConnection();
        }
    }
}
?>
