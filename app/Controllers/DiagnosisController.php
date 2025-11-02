<?php
class DiagnosisController extends Controllers {
    public function __construct() {
        parent::__construct();
    }

    public function index() {
        $this->view("DiagnosisView");
    }

    public function show() {
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            if (!$this->authMiddleware->validateToken()) return;
            $rows = $this->model->getDiagnoses();
            $resp = [];
            if ($rows) {
                foreach ($rows as $d) {
                    $resp[] = [
                        'id' => $d->id,
                        'patient_id' => $d->patient_id,
                        'patient_name' => $d->patient_name,
                        'exam_id' => $d->exam_id,
                        'exam_name' => $d->exam_name,
                        'exam_date' => $d->exam_date,
                        'diagnosis_text' => $d->diagnosis_text,
                        'active' => $d->active
                    ];
                }
            }
            $this->jsonResponse($resp);
        }
    }

    public function insert() {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            if (!$this->authMiddleware->validateToken()) return;
            $json = file_get_contents('php://input');
            $input = json_decode($json, true);
            $data = [
                'patient_id' => isset($input['patient_id']) ? filter_var($input['patient_id'], FILTER_SANITIZE_NUMBER_INT) : null,
                'exam_id' => isset($input['exam_id']) ? filter_var($input['exam_id'], FILTER_SANITIZE_NUMBER_INT) : null,
                'exam_date' => isset($input['exam_date']) ? htmlspecialchars($input['exam_date'], ENT_QUOTES, 'UTF-8') : null,
                'diagnosis_text' => isset($input['diagnosis_text']) ? htmlspecialchars($input['diagnosis_text'], ENT_QUOTES, 'UTF-8') : null,
                'active' => 1,
                'created_by' => 1,
                'updated_by' => 1,
            ];
            $id = $this->model->insertDiagnosis($data);
            $this->jsonResponse($id ? ["success" => true, 'id' => $id] : ["success" => false]);
        }
    }

    public function update() {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            if (!$this->authMiddleware->validateToken()) return;
            $json = file_get_contents('php://input');
            $input = json_decode($json, true);
            $data = [
                'id' => isset($input['id']) ? filter_var($input['id'], FILTER_SANITIZE_NUMBER_INT) : null,
                'patient_id' => isset($input['patient_id']) ? filter_var($input['patient_id'], FILTER_SANITIZE_NUMBER_INT) : null,
                'exam_id' => isset($input['exam_id']) ? filter_var($input['exam_id'], FILTER_SANITIZE_NUMBER_INT) : null,
                'exam_date' => isset($input['exam_date']) ? htmlspecialchars($input['exam_date'], ENT_QUOTES, 'UTF-8') : null,
                'diagnosis_text' => isset($input['diagnosis_text']) ? htmlspecialchars($input['diagnosis_text'], ENT_QUOTES, 'UTF-8') : null,
                'active' => isset($input['active']) ? filter_var($input['active'], FILTER_SANITIZE_NUMBER_INT) : 1,
                'updated_by' => 1,
            ];
            $ok = $this->model->updateDiagnosis($data);
            $this->jsonResponse($ok ? ["success" => true] : ["success" => false]);
        }
    }

    public function delete() {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            if (!$this->authMiddleware->validateToken()) return;
            $json = file_get_contents('php://input');
            $input = json_decode($json, true);
            $data = [
                'id' => isset($input['id']) ? filter_var($input['id'], FILTER_SANITIZE_NUMBER_INT) : null,
                'deleted_by' => 1,
            ];
            $ok = $this->model->deleteDiagnosis($data);
            $this->jsonResponse($ok ? ["success" => true] : ["success" => false]);
        }
    }

    public function filter() {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            if (!$this->authMiddleware->validateToken()) return;
            $json = file_get_contents('php://input');
            $input = json_decode($json, true);
            $id = isset($input['id']) ? filter_var($input['id'], FILTER_SANITIZE_NUMBER_INT) : null;
            $d = $this->model->filterDiagnosis($id);
            if ($d) {
                $this->jsonResponse([
                    'id' => $d->id,
                    'patient_id' => $d->patient_id,
                    'exam_id' => $d->exam_id,
                    'exam_date' => $d->exam_date,
                    'diagnosis_text' => $d->diagnosis_text,
                    'active' => $d->active
                ]);
            }
        }
    }
}
?>
