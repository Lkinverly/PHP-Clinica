
<?php

class RoomHistoryController extends Controllers {
    protected $model;

    public function __construct() {
        parent::__construct();
        $this->model = new RoomHistoryModel(); // <-- asegúrate de crear el modelo
    }

    public function index() {
        $this->view("RoomHistoryView");
    }

    public function show() {
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            return $this->jsonResponse(['error' => 'Método no permitido'], 405);
        }

        // Si usas middleware de auth, respeta el patrón de los demás controladores:
        if (isset($this->authMiddleware) && !$this->authMiddleware->validateToken()) return;

        $summary   = $this->model->getRoomSummary();
        $movements = $this->model->getRoomMovements();

        return $this->jsonResponse(['summary' => $summary, 'movements' => $movements]);
    }
}
