<?php
class DiagnosisModel{
    private $db;

    public function __construct(){
        $this->db = new Database;
    }

    public function closeConnection() {
        $this->db->closeConnection();
    }

    public function getDiagnoses(){
        $this->db->query(
            "SELECT d.id,
                    d.patient_id,
                    CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
                    d.exam_id,
                    e.name AS exam_name,
                    d.exam_date,
                    d.diagnosis_text,
                    d.active
             FROM diagnosis AS d
             INNER JOIN patient AS p ON d.patient_id = p.id
             INNER JOIN exam AS e ON d.exam_id = e.id
             WHERE d.deleted_at IS NULL;"
        );
        return $this->db->records();
    }

    public function insertDiagnosis($data){
        $this->db->query(
            "INSERT INTO diagnosis (patient_id, exam_id, exam_date, diagnosis_text, active, created_by, updated_by)
             VALUES (:patient_id, :exam_id, :exam_date, :diagnosis_text, :active, :created_by, :updated_by);"
        );
        $this->db->bind(":patient_id", $data["patient_id"]);
        $this->db->bind(":exam_id", $data["exam_id"]);
        $this->db->bind(":exam_date", $data["exam_date"]);
        $this->db->bind(":diagnosis_text", $data["diagnosis_text"]);
        $this->db->bind(":active", $data["active"]);
        $this->db->bind(":created_by", $data["created_by"]);
        $this->db->bind(":updated_by", $data["updated_by"]);
        if($this->db->execute()){
            return $this->db->lastInsertId();
        } else{
            return false;
        }
    }

    public function updateDiagnosis($data){
        $this->db->query(
            "UPDATE diagnosis
             SET patient_id = :patient_id,
                 exam_id = :exam_id,
                 exam_date = :exam_date,
                 diagnosis_text = :diagnosis_text,
                 active = :active,
                 updated_at = CURRENT_TIMESTAMP(),
                 updated_by = :updated_by
             WHERE id = :id;"
        );
        $this->db->bind(":id", $data["id"]);
        $this->db->bind(":patient_id", $data["patient_id"]);
        $this->db->bind(":exam_id", $data["exam_id"]);
        $this->db->bind(":exam_date", $data["exam_date"]);
        $this->db->bind(":diagnosis_text", $data["diagnosis_text"]);
        $this->db->bind(":active", $data["active"]);
        $this->db->bind(":updated_by", $data["updated_by"]);
        return $this->db->execute();
    }

    public function deleteDiagnosis($data){
        $this->db->query(
            "UPDATE diagnosis
             SET deleted_at = CURRENT_TIMESTAMP(),
                 deleted_by = :deleted_by
             WHERE id = :id;"
        );
        $this->db->bind(":id", $data["id"]);
        $this->db->bind(":deleted_by", $data["deleted_by"]);
        return $this->db->execute();
    }

    public function filterDiagnosis($id){
        $this->db->query(
            "SELECT d.id,
                    d.patient_id,
                    CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
                    d.exam_id,
                    e.name AS exam_name,
                    d.exam_date,
                    d.diagnosis_text,
                    d.active
             FROM diagnosis AS d
             INNER JOIN patient AS p ON d.patient_id = p.id
             INNER JOIN exam AS e ON d.exam_id = e.id
             WHERE d.id = :id
               AND d.deleted_at IS NULL;"
        );
        $this->db->bind(':id', $id);
        return $this->db->record();
    }
}
?>
