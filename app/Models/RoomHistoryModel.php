<?php
class RoomHistoryModel {
    private $db;

    public function __construct() {
        $this->db = new Database;
    }

    public function closeConnection() {
        $this->db->closeConnection();
    }

    /**
     * Resumen por habitación:
     * - Ocupada/Disponible con base en el último evento de room_assignment por habitación.
     * - Paciente actual si la última marca es 'Activo' (entrada).
     * - Fecha de ingreso (última 'Activo' del paciente actual) y egreso (última 'Inactivo' posterior, si existe).
     */
    public function getRoomSummary() {
        $sql = "
     WITH last_event AS (
            SELECT ra.*,
                ROW_NUMBER() OVER (PARTITION BY ra.room_id ORDER BY ra.created_at DESC, ra.id DESC) AS rn
            FROM room_assignment ra
            WHERE ra.deleted_at IS NULL
        ),
        last_active AS (
            SELECT ra.room_id,
                ra.patient_id,
                MAX(ra.created_at) AS last_ingreso
            FROM room_assignment ra
            WHERE ra.deleted_at IS NULL
            AND ra.status = 'Activo'
            GROUP BY ra.room_id, ra.patient_id
        ),
        last_inactive AS (
            SELECT ra.room_id,
                ra.patient_id,
                MAX(ra.created_at) AS last_egreso
            FROM room_assignment ra
            WHERE ra.deleted_at IS NULL
            AND ra.status = 'Inactivo'
            GROUP BY ra.room_id, ra.patient_id
        )
        SELECT
            r.id                    AS room_id,
            r.name                  AS room_name,
            b.name                  AS branch_name,

            /* 🔥 FIX REAL */
            CASE 
                WHEN le.status = 'Activo' THEN 1
                WHEN le.status = 'Inactivo' THEN 0
                WHEN le.status IS NULL THEN 0
                ELSE 0
            END AS occupied,

            CONCAT(p.first_name,' ',p.last_name) AS patient_name,
            la.last_ingreso AS ingreso_at,
            CASE
                WHEN le.status = 'Activo' THEN (
                    SELECT MAX(ra2.created_at)
                    FROM room_assignment ra2
                    WHERE ra2.deleted_at IS NULL
                    AND ra2.room_id = r.id
                    AND ra2.patient_id = le.patient_id
                    AND ra2.status = 'Inactivo'
                    AND ra2.created_at >= la.last_ingreso
                )
                ELSE NULL
            END AS egreso_at
        FROM room r
        JOIN branch b ON b.id = r.branch_id
        /* ✅ El LEFT JOIN es obligatorio (NO INNER JOIN) */
        LEFT JOIN last_event le ON le.room_id = r.id AND le.rn = 1
        LEFT JOIN patient p ON p.id = le.patient_id
        LEFT JOIN last_active la ON la.room_id = le.room_id AND la.patient_id = le.patient_id
        WHERE r.deleted_at IS NULL
        AND b.deleted_at IS NULL

        ";

        $this->db->query($sql);
        return $this->db->records();
    }

    /**
     * Movimientos crudos (para historial detallado):
     * Cada fila es un evento: entrada (Activo) o salida (Inactivo), con su marca de tiempo.
     */
    public function getRoomMovements() {
        $sql = "
        SELECT
            r.id          AS room_id,
            r.name        AS room_name,
            b.name        AS branch_name,
            ra.id         AS event_id,
            ra.status     AS status,         -- 'Activo' (entrada) / 'Inactivo' (salida)
            ra.created_at AS event_at,
            p.id          AS patient_id,
            CONCAT(p.first_name,' ',p.last_name) AS patient_name
        FROM room_assignment ra
        JOIN room   r ON r.id = ra.room_id
        JOIN branch b ON b.id = ra.branch_id
        JOIN patient p ON p.id = ra.patient_id
        WHERE ra.deleted_at IS NULL
        ORDER BY b.name, r.name, ra.created_at, ra.id;
        ";

        $this->db->query($sql);
        return $this->db->records();
    }
}
