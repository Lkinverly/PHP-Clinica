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
    currentModule = module;
    const url = `${urlBase}/${currentModule}/mostrar`;
    let response = [];
    try {
        response = await apiService.fetchData(url, 'GET');
    } catch (error) {
        if ((error.message || '').includes('401')) {
            localStorage.setItem('tokenExpired', 'true');
            window.location.href = urlBase;
            return;
        }
        showAlert('Error de conexión.', 'danger');
        console.error('patient list error:', error);
        return;
    }
    if (!Array.isArray(response)) {
        try { console.debug('[patient] non-array response', response); } catch (_) {}
        response = [];
    }
    const tableBody = document.getElementById('tableBody');
    const tableHead = document.getElementById('tableHead');
    const addButton = document.getElementById('addButton');
    const moduleData = currentData.modules.find(moduleData => moduleData.link === currentModule) || {};
    const canCreate = Number(moduleData.create_operation) === 1;
    const canUpdate = Number(moduleData.update_operation) === 1;
    const canDelete = Number(moduleData.delete_operation) === 1;
    const hasActions = canUpdate || canDelete;
    let rows = '';

    if (canCreate) {
        addButton.innerHTML = `
            <div class="rounded ps-4">
                <button type="button" class="btn btn-primary fw-bold btn-insert" data-bs-toggle="modal" data-bs-target="#insertModal">Agregar</button>
            </div>
        `;
    } else {
        addButton.innerHTML = ''; // Si no hay permisos, limpiar el contenedor
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

    response.forEach(item => {
        const dataInfo = JSON.stringify({patient_id: item.id}).replace(/"/g, '&quot;');
        const status = item.active ? 'Activo' : 'Inactivo';
        const alertType = item.active ? 'success' : 'danger';

        let actionButtons = '';
        
        // Crear los botones de acuerdo a los permisos
        if (canUpdate) {
            actionButtons += createButton('btn-info btn-room', 'Editar', dataInfo, 'roomModal', 'bi bi-door-closed');
            actionButtons += createButton('btn-primary btn-update', 'Editar', dataInfo, 'updateModal', 'bi bi-pencil');
        }
        if (canDelete) {
            actionButtons += createButton('btn-danger btn-delete', 'Borrar', dataInfo, 'deleteModal', 'bi bi-trash-fill');
        }

        rows += `
            <tr>
                <td>${item.id}</td>
                <td>${item.name}</td>
                <td>${item.email}</td>
                <td>${item.gender}</td>
                <td>${item.address}</td>
                <td>${item.phone}</td>
                <td>${item.birth_date}</td>
                <td>${item.room}</td>
                <td><span class="badge bg-${alertType}">${status}</span></td>
                ${hasActions ? `<td><div class="d-flex">${actionButtons}</div></td>` : ''}
            </tr>
        `;
    });
    
    tableBody.innerHTML = rows;
    
    assignSearchEvent('searchInput', 'tableBody', [0, 1, 2, 3, 4, 5, 6, 7, 8]);

    if (hasActions) {
        assignModalEvent('.btn-room', roomModal);
        assignModalEvent('.btn-update', updateModal);
        assignModalEvent('.btn-delete', deleteModal);
    }

    assignFormSubmitEvent('roomForm', roomFormSubmit);
    assignFormSubmitEvent('insertForm', insertFormSubmit);
    assignFormSubmitEvent('updateForm', updateFormSubmit);
    assignFormSubmitEvent('deleteForm', deleteFormSubmit);

    resetModal('insertModal', 'insertForm');
}

const populateSelect = async (selectId, module) =>  {
    const select = document.getElementById(selectId);
    const newSelect = select.outerHTML;
    select.outerHTML = newSelect;

    const newSelectElement = document.getElementById(selectId);
    newSelectElement.innerHTML = '';

    try {
        let options = await apiService.fetchData(`${urlBase}/${module}/mostrar`, 'GET');
        if (!Array.isArray(options)) options = [];
        const defaultOption = new Option('Sin Asignar', '');
        newSelectElement.appendChild(defaultOption);

        options.forEach(item => {
            if (Number(item.active) === 1) {
                const option = document.createElement('option');
                option.value = item.id;
                option.textContent = item.name;
                newSelectElement.appendChild(option);
            }
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

const populateSelectRoom = async (selectId, module, patientId) =>  {
    const select = document.getElementById(selectId);
    const newSelect = select.outerHTML;
    select.outerHTML = newSelect;

    const newSelectElement = document.getElementById(selectId);
    newSelectElement.innerHTML = '';

    try {
        const branch_id = document.getElementById('roomModBranch').value;
        const options = await apiService.fetchData(`${urlBase}/${module}/mostrar`, 'POST', { branch_id, patient_id: patientId });
        
        // Crear la opción por defecto
        const defaultOption = new Option('Seleccionar', '');
        defaultOption.hidden = true;
        defaultOption.selected = true;
        newSelectElement.appendChild(defaultOption);

        // Verificar si hay opciones disponibles
        if (options && options.length > 0) {
            // Si hay opciones, agregar cada una al <select>
            options.forEach(item => {
                const option = document.createElement('option');
                option.value = item.id;
                option.textContent = item.name;
                newSelectElement.appendChild(option);
            });
        } else if (branch_id == '' && options.length === 0) {
            newSelectElement.innerHTML = '';
            const noRoomsOption = new Option('Sin Asignar', '0');
            noRoomsOption.hidden = true;
            noRoomsOption.selected = true;
            newSelectElement.appendChild(noRoomsOption);
        } else {
            // Si no hay opciones, mostrar un mensaje de "No hay habitaciones"
            const noRoomsOption = new Option('No hay habitaciones disponibles', '');
            noRoomsOption.disabled = true;
            newSelectElement.appendChild(noRoomsOption);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

const roomModal = async (data) => {
    const url = `${urlBase}/pacientehabitacion/filtrar`;
    const dataInfo = JSON.stringify(data);
    const patient_id = data.patient_id;
    await populateSelect('roomModBranch', 'sucursal');
    
    document.getElementById('roomModBranch').addEventListener('change', async function () {
        await populateSelectRoom('roomModRoom', 'pacientehabitacion', patient_id);
    });
    
    try {
        const response = await apiService.fetchData(url, 'POST', { patient_id });
        const branchSelect = document.getElementById('roomModBranch');
        const branchOption = Array.from(branchSelect.options).find(option => option.text === response.branch_name);
        document.getElementById('roomForm').setAttribute('data-info', dataInfo);
        document.getElementById('roomModBranch').value = branchOption ? branchOption.value : '';
        await populateSelectRoom('roomModRoom', 'pacientehabitacion');
        const roomSelect = document.getElementById('roomModRoom');
        const roomOption = Array.from(roomSelect.options).find(option => option.text === response.room_name);
        document.getElementById('roomModRoom').value = roomOption ? roomOption.value : document.getElementById('roomModRoom').value;

    } catch (error) {
        console.error('Error:', error);
    }
};

const roomFormSubmit = async () => {
    const urlInsert = `${urlBase}/pacientehabitacion/agregar`;
    const urlUpdate = `${urlBase}/pacientehabitacion/actualizar`;
    const dataInfo = JSON.parse(document.getElementById('roomForm').getAttribute('data-info'));
    
    const room = document.getElementById('roomModRoom').value
    const branch = document.getElementById('roomModBranch').value

    
    const existingRoom = await apiService.fetchData(
        `${urlBase}/pacientehabitacion/buscar`,
        'POST', 
        { patient_id: dataInfo.patient_id }
    );

    if (existingRoom) {
        const formData = () => ({
            patient_id: existingRoom.patient_id,
            branch_id: Number(branch) || null,
            room_id: Number(room) || null,
            status: Number(room)  ? 1 : 0,
            updated_by: currentData.user_id || null
        });
        
        try {
            await apiService.fetchData(urlUpdate, 'POST', formData());
            showAlert("Operación exitosa.", 'success');
            closeModal('roomModal');
        } catch (error) {
            showAlert("Error de conexión.", 'danger');
        }
    } else {
        const formData = () => ({
            patient_id: dataInfo.patient_id,
            branch_id: Number(branch) || null,
            room_id: Number(room) || null,
            status: Number(room)  ? 1 : 0,
            created_by: currentData.user_id || null,
            updated_by: currentData.user_id || null
        });
        
        try {
            await apiService.fetchData(urlInsert, 'POST', formData());
            showAlert("Operación exitosa.", 'success');
            closeModal('roomModal');
        } catch (error) {
            showAlert("Error de conexión.", 'danger');
        }
    }

    

    await initModule(currentData, currentModule);
};


const insertFormSubmit = async () => {
    const url = `${urlBase}/${currentModule}/agregar`;
    
    const formData = () => ({
        first_name: document.getElementById('insModFirstName').value || '',
        last_name: document.getElementById('insModLastName').value || '',
        email: document.getElementById('insModEmail').value || '',
        gender: document.getElementById('insModGender').value || '',
        address: document.getElementById('insModAddress').value || '',
        phone: document.getElementById('insModPhone').value || '',
        birth_date: document.getElementById('insModBirthDate').value || '',
        active: Number(document.getElementById('insModStatus').value),
        created_by: currentData.user_id || null,
        updated_by: currentData.user_id || null
    });
    
    try {
        await apiService.fetchData(url, 'POST', formData());
        showAlert("Operación exitosa.", 'success');
        closeModal('insertModal');
    } catch (error) {
        showAlert("Error de conexión.", 'danger');
        console.error('Error:', error);
    }

    await initModule(currentData, currentModule);
};

const updateModal = async (data) => {
    const url = `${urlBase}/${currentModule}/filtrar`;
    const dataInfo = JSON.stringify(data);
    const id = data.patient_id;

    try {
        const response = await apiService.fetchData(url, 'POST', { id });

        document.getElementById('updateForm').setAttribute('data-info', dataInfo);
        document.getElementById('updModPatientCode').value = response.id || '';
        document.getElementById('updModFirstName').value = response.first_name || '';
        document.getElementById('updModLastName').value = response.last_name || '';
        document.getElementById('updModEmail').value = response.email || '';
        document.getElementById('updModGender').value = response.gender || '';
        document.getElementById('updModAddress').value = response.address || '';
        document.getElementById('updModPhone').value = response.phone || '';
        document.getElementById('updModBirthDate').value = response.birth_date || '';
        document.getElementById('updModStatus').value = response.active.toString() || '';
    } catch (error) {
        console.error('Error:', error);
    }
};


const updateFormSubmit = async () => {
    const url = `${urlBase}/${currentModule}/actualizar`;
    const dataInfo = JSON.parse(document.getElementById('updateForm').getAttribute('data-info'));

    const formData = () => ({
        first_name: document.getElementById('updModFirstName').value || '',
        last_name: document.getElementById('updModLastName').value || '',
        email: document.getElementById('updModEmail').value || '',
        gender: document.getElementById('updModGender').value || '',
        address: document.getElementById('updModAddress').value || '',
        phone: document.getElementById('updModPhone').value || '',
        birth_date: document.getElementById('updModBirthDate').value || '',
        active: Number(document.getElementById('updModStatus').value),
        updated_by: currentData.user_id || null,
        id: dataInfo.patient_id || null
    });
    
    try {
        await apiService.fetchData(url, 'POST', formData());
        showAlert("Operación exitosa.", 'success');
        closeModal('updateModal');
    } catch (error) {
        showAlert("Error de conexión.", 'danger');
        console.error('Error:', error);
    }

    await initModule(currentData, currentModule);
};

const deleteModal = async (data) => {
    const url = `${urlBase}/${currentModule}/filtrar`;
    const dataInfo = JSON.stringify(data);
    const id = data.patient_id;
    
    try {
        const response = await apiService.fetchData(url, 'POST', { id });
        const status = response.active ? 'Activo' : 'Inactivo';
        const name = response.first_name + ' ' + response.last_name;

        document.getElementById('deleteForm').setAttribute('data-info', dataInfo);
        document.getElementById('delModPatientCode').innerText = response.id || '';
        document.getElementById('delModName').innerText = name || '';
        document.getElementById('delModEmail').innerText = response.email || '';
        document.getElementById('delModGender').innerText = response.gender || '';
        document.getElementById('delModAddress').innerText = response.address || '';
        document.getElementById('delModPhone').innerText = response.phone || '';
        document.getElementById('delModBirthDate').innerText = response.birth_date || '';
        document.getElementById('delModStatus').innerText = status || '';

    } catch (error) {
        console.error('Error:', error);
    }
};

const deleteFormSubmit = async () => {
    const url = `${urlBase}/${currentModule}/eliminar`;
    const dataInfo = JSON.parse(document.getElementById('deleteForm').getAttribute('data-info'));

    const formData = () => ({
        deleted_by: currentData.user_id || null,
        id: dataInfo.patient_id || null
    });

    try {
        await apiService.fetchData(url, 'POST', formData());
        showAlert("Operación exitosa.", 'success');
        closeModal('deleteModal');
    } catch (error) {
        showAlert("Error de conexión.", 'danger');
        console.error('Error:', error);
    }

    await initModule(currentData, currentModule);
};
