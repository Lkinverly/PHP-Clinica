<?php
class PatientController extends Controllers {
    public function __construct() {
        parent::__construct();
    }
    
    public function index() {
        $this->view("PatientView");
    }

    public function show() {
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            if (!$this->authMiddleware->validateToken()) {
                http_response_code(401);
                $this->jsonResponse([]);
            }
            $patients = $this->model->getPatients();
            $response = [];
            if ($patients) {
                foreach ($patients as $patient){
                    $response[] = [
                        'id' => $patient->id,
                        'name' => $patient->name,
                        'birth_date' => $patient->birth_date,
                        'gender' =>$patient->gender,
                        'address' =>$patient->address,
                        'phone' =>$patient->phone,
                        'email' => $patient->email,
                        'room' => $patient->room,
                        'active' => $patient->active
                    ];
                }
            }
            $this->jsonResponse($response);
        }
    }

    public function insert() {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            if (!$this->authMiddleware->validateToken()) return;
            
            $json = file_get_contents('php://input');
            $decodedData = json_decode($json, true); 
    
            $data = [
                "first_name" => isset($decodedData['first_name']) ? htmlspecialchars($decodedData['first_name'], ENT_QUOTES, 'UTF-8') : null,
                "last_name" => isset($decodedData['last_name']) ? htmlspecialchars($decodedData['last_name'], ENT_QUOTES, 'UTF-8') : null,
                "birth_date" => isset($decodedData['birth_date']) ? htmlspecialchars($decodedData['birth_date'], ENT_QUOTES, 'UTF-8') : null,
                "gender" => isset($decodedData['gender']) ? htmlspecialchars($decodedData['gender'], ENT_QUOTES, 'UTF-8') : null,
                "address" => isset($decodedData['address']) ? htmlspecialchars($decodedData['address'], ENT_QUOTES, 'UTF-8') : null,
                "phone" => isset($decodedData['phone']) ? htmlspecialchars($decodedData['phone'], ENT_QUOTES, 'UTF-8') : null,
                "email" => isset($decodedData['email']) ? filter_var($decodedData['email'], FILTER_SANITIZE_EMAIL) : null,
                "active" => isset($decodedData['active']) ? filter_var($decodedData['active'], FILTER_SANITIZE_NUMBER_INT) : null,
                "created_by" => isset($decodedData['created_by']) ? filter_var($decodedData['created_by'], FILTER_SANITIZE_NUMBER_INT) : null,
                "updated_by" => isset($decodedData['updated_by']) ? filter_var($decodedData['updated_by'], FILTER_SANITIZE_NUMBER_INT) : null,
            ];
    
            if ($this->model->insertPatient($data)) {
                $this->jsonResponse(["success" => true]);
            } else {
                $this->jsonResponse(["success" => false]);
            }
        }
    }

    public function update() {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            if (!$this->authMiddleware->validateToken()) return;
            
            // Obtener el contenido de la solicitud y decodificar el JSON
            $json = file_get_contents('php://input');
            $decodedData = json_decode($json, true); // Decodifica el JSON en un array asociativo
    
            $data = [
                "id" => isset($decodedData['id']) ? filter_var($decodedData['id'], FILTER_SANITIZE_NUMBER_INT) : null,
                "first_name" => isset($decodedData['first_name']) ? htmlspecialchars($decodedData['first_name'], ENT_QUOTES, 'UTF-8') : null,
                "last_name" => isset($decodedData['last_name']) ? htmlspecialchars($decodedData['last_name'], ENT_QUOTES, 'UTF-8') : null,
                "birth_date" => isset($decodedData['birth_date']) ? htmlspecialchars($decodedData['birth_date'], ENT_QUOTES, 'UTF-8') : null,
                "gender" => isset($decodedData['gender']) ? htmlspecialchars($decodedData['gender'], ENT_QUOTES, 'UTF-8') : null,
                "address" => isset($decodedData['address']) ? htmlspecialchars($decodedData['address'], ENT_QUOTES, 'UTF-8') : null,
                "phone" => isset($decodedData['phone']) ? htmlspecialchars($decodedData['phone'], ENT_QUOTES, 'UTF-8') : null,
                "email" => isset($decodedData['email']) ? filter_var($decodedData['email'], FILTER_SANITIZE_EMAIL) : null,
                "active" => isset($decodedData['active']) ? filter_var($decodedData['active'], FILTER_SANITIZE_NUMBER_INT) : null,
                "updated_by" => isset($decodedData['updated_by']) ? filter_var($decodedData['updated_by'], FILTER_SANITIZE_NUMBER_INT) : null
            ];
            
            if ($this->model->updatePatient($data)) {
                $this->jsonResponse(["success" => true]);
            } else {
                $this->jsonResponse(["success" => false]);
            }
        }
    }
    
    public function delete() {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            if (!$this->authMiddleware->validateToken()) return;
    
            // Obtener el contenido de la solicitud y decodificar el JSON
            $json = file_get_contents('php://input');
            $decodedData = json_decode($json, true); // Decodifica el JSON en un array asociativo
    
            $data = [
                "id" => isset($decodedData['id']) ? filter_var($decodedData['id'], FILTER_SANITIZE_NUMBER_INT) : null, 
                "deleted_by" => isset($decodedData['deleted_by']) ? filter_var($decodedData['deleted_by'], FILTER_SANITIZE_NUMBER_INT) : null 
            ];
    
    
            if ($this->model->deletePatient($data)) {
                $this->jsonResponse(["success" => true]);
            } else {
                $this->jsonResponse(["success" => false]);
            }
        }
    }

    public function filter() {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            if (!$this->authMiddleware->validateToken()) return;
            $json = file_get_contents('php://input');
            $decodedData = json_decode($json, true); 
    
            $id = isset($decodedData['id']) ? filter_var($decodedData['id'], FILTER_SANITIZE_NUMBER_INT) : null;
            $patient = $this->model->filterPatient($id);
    
            if ($patient) {
                $response = [
                    'id' => $patient->id,
                    'first_name' => $patient->first_name,
                    'last_name' => $patient->last_name,
                    'birth_date' => $patient->birth_date,
                    'gender' =>$patient->gender,
                    'address' =>$patient->address,
                    'phone' =>$patient->phone,
                    'email' => $patient->email,
                    'active' => $patient->active
                ];
                  
                $this->jsonResponse($response);       
            }
        }   
    }   
}
?>
