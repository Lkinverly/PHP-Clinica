import { apiService } from '../services/apiService.js';

let currentModule;

export async function initModule(data, module) {
    currentModule = module;
    const url = `${urlBase}/${currentModule}/mostrar`;

    try {
        const response = await apiService.fetchData(url, 'GET');
        const summary   = response.summary   || [];
        const movements = response.movements || [];

        // Limpia contenedores
        $('#roomsHistoryCards').empty();
        $('#roomsHistoryTables').empty();

        // --- Tarjetas de resumen por habitación ---
        summary.forEach(item => {
          const {
              room_id, room_name, branch_name,
              occupied, patient_name, ingreso_at, egreso_at
          } = item;

          const occupiedBool = Number(occupied) === 1;
      
          const badgeClass = occupiedBool ? 'bg-danger' : 'bg-success';
          const badgeText  = occupiedBool ? 'Ocupada'   : 'Libre';
      
          const displayPatient = occupiedBool ? (patient_name ?? '—') : 'Sin paciente asignado';
          const displayIngreso = occupiedBool ? (ingreso_at ?? '—')   : '—';
          const displayEgreso  = occupiedBool ? (egreso_at ?? '—')    : '—';
      
          const card = `
            <div class="col-md-4 mb-4">
              <div class="card text-center" style="background-color:#f3f6f9;">
                <div class="card-body">
                  <h5 class="card-title mb-1">
                    Hab. ${room_name} <small class="text-muted">(${branch_name})</small>
                  </h5>
                  <span class="badge ${badgeClass}">${badgeText}</span>
                  <hr class="my-2">
                  <p class="mb-1"><strong>Paciente actual:</strong> ${displayPatient}</p>
                  <p class="mb-1"><strong>Ingreso:</strong> ${displayIngreso}</p>
                  <p class="mb-0"><strong>Egreso:</strong> ${displayEgreso}</p>
                </div>
              </div>
            </div>`;
          $('#roomsHistoryCards').append(card);
      });

        // --- Historial detallado: agrupación por habitación y paciente ---
        // Construye estructura: room -> lista de periodos (paciente, ingreso, egreso)
        const byRoom = {};
        movements.forEach(m => {
            const key = `${m.room_id}|${m.room_name}|${m.branch_name}`;
            if (!byRoom[key]) byRoom[key] = [];
            byRoom[key].push(m);
        });

        Object.entries(byRoom).forEach(([key, rows]) => {
            // Ordenados ya por fecha; emparejar 'Activo' (entrada) con siguiente 'Inactivo' del mismo paciente
            const periods = [];
            const openByPatient = new Map();

            rows.forEach(ev => {
                const pid = ev.patient_id;
                if (ev.status === 'Activo') {
                    openByPatient.set(pid, { patient_name: ev.patient_name, ingreso_at: ev.event_at, egreso_at: null });
                } else if (ev.status === 'Inactivo') {
                    const opened = openByPatient.get(pid);
                    if (opened && !opened.egreso_at) {
                        opened.egreso_at = ev.event_at;
                        periods.push(opened);
                        openByPatient.delete(pid);
                    } else {
                        // salida sin entrada previa visible -> registra como periodo suelto
                        periods.push({ patient_name: ev.patient_name, ingreso_at: null, egreso_at: ev.event_at });
                    }
                }
            });

            // Cierra entradas abiertas (siguen internados)
            for (const opened of openByPatient.values()) periods.push(opened);

            // Render tabla
            const [, room_name, branch_name] = key.split('|');
            const table = `
              <div class="col-12 mb-4">
                <div class="card">
                  <div class="card-header d-flex justify-content-between">
                    <div><strong>Historial Hab. ${room_name}</strong> <small class="text-muted">(${branch_name})</small></div>
                  </div>
                  <div class="card-body">
                    <div class="table-responsive">
                      <table class="table table-sm">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Paciente</th>
                            <th>Ingreso</th>
                            <th>Egreso</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${periods.map((p, idx) => `
                            <tr>
                              <td>${idx + 1}</td>
                              <td>${p.patient_name ?? '—'}</td>
                              <td>${p.ingreso_at ?? '—'}</td>
                              <td>${p.egreso_at ?? '—'}</td>
                            </tr>
                          `).join('')}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>`;
            $('#roomsHistoryTables').append(table);
        });

    } catch (err) {
        console.error(err);
        // Reutiliza tu alerta estándar
        // showAlert('Error al cargar el historial de habitaciones', 'danger');
    }
}
