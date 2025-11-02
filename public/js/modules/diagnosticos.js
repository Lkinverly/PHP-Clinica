import { apiService } from '../services/apiService.js';
import { showAlert } from '../utils/showArlert.js';
import {
  createButton,
  assignModalEvent,
  assignFormSubmitEvent,
  assignSearchEvent,
  closeModal,
  resetModal
} from '../utils/actionButton.js';

let currentData;
let currentModule;

export async function initModule(data, module) {
  currentData = data;
  currentModule = module; // expected 'diagnosticos'

  const listUrl = `${urlBase}/${currentModule}/mostrar`;
  let response = [];
  try {
    response = await apiService.fetchData(listUrl, 'GET');
  } catch (error) {
    if ((error.message || '').includes('401')) {
      localStorage.setItem('tokenExpired', 'true');
      window.location.href = urlBase;
      return;
    }
    try { console.error('[diagnosticos] listar error', error); } catch (_) {}
    showAlert('Error de conexión.', 'danger');
    return;
  }

  const tableBody = document.getElementById('tableBody');
  const tableHead = document.getElementById('tableHead');
  const addButton = document.getElementById('addButton');
  const exportButton = document.getElementById('exportButton');
  const moduleData =
    currentData.modules.find(m => m.link === currentModule) ||
    currentData.modules.find(m => (m.link || '').toLowerCase().includes('diagnost')) ||
    {};

  const canCreate = Number(moduleData.create_operation) === 1;
  const canUpdate = Number(moduleData.update_operation) === 1;
  const canDelete = Number(moduleData.delete_operation) === 1;

  // Debug: visibility flags
  try { console.debug('[diagnosticos] moduleData', moduleData, { canCreate, canUpdate, canDelete, currentModule }); } catch (_) {}
  const hasActions = canUpdate || canDelete;

  if (canCreate) {
    addButton.innerHTML = `
      <div class="rounded ps-4">
        <button type="button" class="btn btn-primary fw-bold btn-insert" data-bs-toggle="modal" data-bs-target="#insertModal">Agregar</button>
      </div>
    `;

    const insertModal = document.getElementById('insertModal');
    insertModal.addEventListener('show.bs.modal', () => {
      populateSelect('insModPatientId', 'paciente');
      populateSelect('insModExamId', 'examen');
    });
  } else {
    addButton.innerHTML = '';
  }

  // Exportar PDF: botón siempre visible
  if (exportButton) {
    exportButton.innerHTML = `
      <div class="rounded ps-2">
        <button type="button" class="btn btn-outline-secondary fw-bold" id="btnExportPdf" title="Descargar PDF">
          <i class="bi bi-file-earmark-pdf me-1"></i>Descargar PDF
        </button>
      </div>
    `;

    // Resetear y asignar handler
    const btn = document.getElementById('btnExportPdf');
    if (btn) {
      const newBtn = btn.outerHTML;
      btn.outerHTML = newBtn;
      const freshBtn = document.getElementById('btnExportPdf');
      freshBtn.addEventListener('click', exportDiagnosticosPdf);
    }
  }

  if (hasActions) {
    if (!document.querySelector('th.action-column')) {
      const actionHeader = document.createElement('th');
      actionHeader.scope = 'col';
      actionHeader.textContent = 'Acción';
      actionHeader.classList.add('action-column');
      tableHead.querySelector('tr').appendChild(actionHeader);
    }
  }

  let rows = '';
  response.forEach(item => {
    const dataInfo = JSON.stringify({ id: item.id }).replace(/\"/g, '&quot;');
    const status = item.active ? 'Activo' : 'Inactivo';
    const alertType = item.active ? 'success' : 'danger';

    let actionButtons = '';
    if (canUpdate) actionButtons += createButton('btn-primary btn-update', 'Editar', dataInfo, 'updateModal', 'bi bi-pencil');
    if (canDelete) actionButtons += createButton('btn-danger btn-delete', 'Borrar', dataInfo, 'deleteModal', 'bi bi-trash-fill');

    rows += `
      <tr>
        <td>${item.patient_name || ''}</td>
        <td>${item.exam_name || ''}</td>
        <td>${item.exam_date || ''}</td>
        <td>${(item.diagnosis_text || '').toString().slice(0,120)}</td>
        <td><span class="badge bg-${alertType}">${status}</span></td>
        ${hasActions ? `<td><div class="d-flex">${actionButtons}</div></td>` : ''}
      </tr>
    `;
  });

  tableBody.innerHTML = rows;

  assignSearchEvent('searchInput', 'tableBody', [0, 1, 2, 3]);

  if (hasActions) {
    assignModalEvent('.btn-update', updateModal);
    assignModalEvent('.btn-delete', deleteModal);
  }

  assignFormSubmitEvent('insertForm', insertFormSubmit);
  assignFormSubmitEvent('updateForm', updateFormSubmit);
  assignFormSubmitEvent('deleteForm', deleteFormSubmit);

  resetModal('insertModal', 'insertForm');
}

// Construir HTML imprimible removiendo columna de acciones si existe
const getPrintableTableHtml = () => {
  const tableEl = document.querySelector('.table-responsive table');
  if (!tableEl) return '<p>No hay datos para exportar.</p>';

  const clone = tableEl.cloneNode(true);
  const headRow = clone.querySelector('thead tr');
  let actionIdx = -1;
  if (headRow) {
    actionIdx = Array.from(headRow.cells).findIndex(c =>
      c.classList.contains('action-column') || (c.textContent || '').trim().toLowerCase() === 'acción'
    );
    if (actionIdx >= 0) {
      headRow.deleteCell(actionIdx);
      clone.querySelectorAll('tbody tr').forEach(tr => {
        if (tr.cells.length > actionIdx) tr.deleteCell(actionIdx);
      });
    }
  }
  return clone.outerHTML;
};

// Abrir ventana de impresión para guardar como PDF
const exportDiagnosticosPdf = () => {
  const printableTable = getPrintableTableHtml();
  const now = new Date();
  const today = now.toLocaleDateString();
  const title = 'Diagnósticos Registrados';

  const html = `<!DOCTYPE html>
  <html lang="es">
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <link rel="stylesheet" href="${urlBase}/css/bootstrap.min.css">
      <style>
        body { padding: 20px; }
        h3 { margin-bottom: 16px; }
        .meta { margin-bottom: 12px; color: #6c757d; }
        @media print {
          a { text-decoration: none; color: inherit; }
          .table { width: 100%; }
        }
      </style>
    </head>
    <body>
      <h3>${title}</h3>
      <div class="meta">Fecha: ${today}</div>
      ${printableTable}
      <script>
        window.onload = function(){
          try { window.print(); } catch(e) {}
          window.onafterprint = function(){ try { window.close(); } catch(e) {} };
          setTimeout(function(){ try { window.close(); } catch(e) {} }, 1000);
        };
      </script>
    </body>
  </html>`;

  const printWin = window.open('', '_blank');
  if (!printWin) return;
  printWin.document.open();
  printWin.document.write(html);
  printWin.document.close();
};

const populateSelect = async (selectId, module) => {
  const select = document.getElementById(selectId);
  const newSelect = select.outerHTML; // reset listeners
  select.outerHTML = newSelect;
  const el = document.getElementById(selectId);
  el.innerHTML = '';

  try {
    let options = await apiService.fetchData(`${urlBase}/${module}/mostrar`, 'GET');
    if (!Array.isArray(options)) {
      options = [];
    }
    options.forEach(item => {
      if (Number(item.active) === 1) {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = item.name;
        el.appendChild(option);
      }
    });
  } catch (e) {
    console.error('Error:', e);
  }
};

const insertFormSubmit = async () => {
  const url = `${urlBase}/${currentModule}/agregar`;
  const body = () => ({
    patient_id: Number(document.getElementById('insModPatientId').value) || null,
    exam_id: Number(document.getElementById('insModExamId').value) || null,
    exam_date: document.getElementById('insModDate').value || '',
    diagnosis_text: document.getElementById('insModDiagnosisText').value || '',
    created_by: currentData.user_id || 1,
    updated_by: currentData.user_id || 1
  });

  try {
    const resp = await apiService.fetchData(url, 'POST', body());
    if (resp && resp.success) {
      showAlert('Operación exitosa.', 'success');
      closeModal('insertModal');
      await initModule(currentData, currentModule);
    }
  } catch (e) {
    showAlert('Error de conexión.', 'danger');
    console.error('Error:', e);
  }
};

const updateModal = async (data) => {
  const url = `${urlBase}/${currentModule}/filtrar`;
  const id = data.id;
  await populateSelect('updModPatientId', 'paciente');
  await populateSelect('updModExamId', 'examen');

  try {
    const resp = await apiService.fetchData(url, 'POST', { id });
    document.getElementById('updateForm').setAttribute('data-info', JSON.stringify({ id }));
    document.getElementById('updModPatientId').value = resp.patient_id || '';
    document.getElementById('updModExamId').value = resp.exam_id || '';
    document.getElementById('updModDate').value = resp.exam_date || '';
    document.getElementById('updModDiagnosisText').value = resp.diagnosis_text || '';
  } catch (e) {
    console.error('Error:', e);
  }
};

const updateFormSubmit = async () => {
  const url = `${urlBase}/${currentModule}/actualizar`;
  const info = JSON.parse(document.getElementById('updateForm').getAttribute('data-info'));
  const body = () => ({
    id: info.id || null,
    patient_id: Number(document.getElementById('updModPatientId').value) || null,
    exam_id: Number(document.getElementById('updModExamId').value) || null,
    exam_date: document.getElementById('updModDate').value || '',
    diagnosis_text: document.getElementById('updModDiagnosisText').value || '',
    updated_by: currentData.user_id || 1
  });

  try {
    const resp = await apiService.fetchData(url, 'POST', body());
    if (resp && resp.success) {
      showAlert('Operación exitosa.', 'success');
      closeModal('updateModal');
      await initModule(currentData, currentModule);
    }
  } catch (e) {
    showAlert('Error de conexión.', 'danger');
    console.error('Error:', e);
  }
};

const deleteModal = async (data) => {
  const url = `${urlBase}/${currentModule}/filtrar`;
  const id = data.id;
  try {
    const resp = await apiService.fetchData(url, 'POST', { id });
    document.getElementById('deleteForm').setAttribute('data-info', JSON.stringify({ id }));
    document.getElementById('delModPatient').innerText = resp.patient_name || '';
    document.getElementById('delModExam').innerText = resp.exam_name || '';
    document.getElementById('delModDate').innerText = resp.exam_date || '';
  } catch (e) {
    console.error('Error:', e);
  }
};

const deleteFormSubmit = async () => {
  const url = `${urlBase}/${currentModule}/eliminar`;
  const info = JSON.parse(document.getElementById('deleteForm').getAttribute('data-info'));
  const body = () => ({ id: info.id || null, deleted_by: currentData.user_id || 1 });
  try {
    const resp = await apiService.fetchData(url, 'POST', body());
    if (resp && resp.success) {
      showAlert('Operación exitosa.', 'success');
      closeModal('deleteModal');
      await initModule(currentData, currentModule);
    }
  } catch (e) {
    showAlert('Error de conexión.', 'danger');
    console.error('Error:', e);
  }
};
