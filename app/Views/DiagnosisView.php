<?php require_once APP_ROUTE."/Views/Template/Header.php"; ?>
            <div id="content">
                <!-- Titulo del Módulo Inicio (estándar con ids esperados) -->
                <div class="container-fluid pt-4 px-4">
                    <div class="row">
                        <div id="iconClassTitle" class="col-12 col-sm-5 mb-0">
                            <div class="bg-transparent rounded d-flex align-items-center px-2">
                                <i id="moduleIcon"></i>
                                <h4 id="moduleTitle" class="mb-0"></h4>
                            </div>
                        </div>
                        <div id="buttonClassTitle" class="col-12 col-sm-7 d-flex align-items-center justify-content-start justify-content-sm-end">
                            <div class="bg-transparent rounded d-flex">
                                <div class="rounded">
                                    <input type="text" class="form-control" id="searchInput" placeholder="Buscar">
                                </div>
                                <div id="addButton"></div>
                                <div id="exportButton" class="ms-2"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- Titulo del Módulo Fin -->
                <!-- Insert Diagnosis Modal -->
                <div class="modal fade" id="insertModal" tabindex="-1" aria-labelledby="insertModalLabel" aria-hidden="true">
                    <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title w-100 text-center" id="insertTitle">Agregar Diagnóstico</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <form id="insertForm" data-info="">
                                    <div class="row">
                                        <div class="mb-2 mb-sm-3 px-4">
                                            <label for="insModPatientId" class="form-label mb-0">Paciente</label>
                                            <select name="insModPatientId" class="form-control form-select" id="insModPatientId" required></select>
                                        </div>
                                        <div class="mb-2 mb-sm-3 px-4">
                                            <label for="insModExamId" class="form-label mb-0">Examen</label>
                                            <select name="insModExamId" class="form-control form-select" id="insModExamId" required></select>
                                        </div>
                                        <div class="mb-2 mb-sm-3 px-4">
                                            <label for="insModDate" class="form-label mb-0">Fecha del diagnóstico</label>
                                            <input type="date" class="form-control" id="insModDate" required>
                                        </div>
                                        <div class="mb-2 mb-sm-3 px-4">
                                            <label for="insModDiagnosisText" class="form-label mb-0">Diagnóstico</label>
                                            <textarea class="form-control" id="insModDiagnosisText" rows="3" placeholder="Escribe el diagnóstico..."></textarea>
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div class="modal-footer justify-content-center">
                                <button type="submit" class="btn btn-primary" form="insertForm">Guardar</button>
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Update Diagnosis Modal -->
                <div class="modal fade" id="updateModal" tabindex="-1" aria-labelledby="updateModalLabel" aria-hidden="true">
                    <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title w-100 text-center" id="updateTitle">Actualizar Diagnóstico</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <form id="updateForm" data-info="">
                                    <div class="row">
                                        <div class="mb-2 mb-sm-3 px-4">
                                            <label for="updModPatientId" class="form-label mb-0">Paciente</label>
                                            <select name="updModPatientId" class="form-control form-select" id="updModPatientId" required></select>
                                        </div>
                                        <div class="mb-2 mb-sm-3 px-4">
                                            <label for="updModExamId" class="form-label mb-0">Examen</label>
                                            <select name="updModExamId" class="form-control form-select" id="updModExamId" required></select>
                                        </div>
                                        <div class="mb-2 mb-sm-3 px-4">
                                            <label for="updModDate" class="form-label mb-0">Fecha del diagnóstico</label>
                                            <input type="date" class="form-control" id="updModDate" required>
                                        </div>
                                        <div class="mb-2 mb-sm-3 px-4">
                                            <label for="updModDiagnosisText" class="form-label mb-0">Diagnóstico</label>
                                            <textarea class="form-control" id="updModDiagnosisText" rows="3"></textarea>
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div class="modal-footer justify-content-center">
                                <button type="submit" class="btn btn-primary" form="updateForm">Actualizar</button>
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Module Title -->
                <div class="container-fluid pt-4 px-4">
                    <div class="row g-4 mb-4">
                        <div class="col-12">
                            <div class="bg-light rounded d-flex align-items-center justify-content-between p-4">
                                <h6 class="mb-0">Diagnósticos</h6>
                                <div id="addButton"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Registered Diagnoses -->
                <div class="container-fluid pt-4 px-4">
                    <div class="bg-light text-center rounded p-4">
                        <div class="d-flex align-items-center justify-content-between mb-4">
                            <h6 class="mb-0">Diagnósticos Registrados</h6>
                        </div>
                        <div class="table-responsive">
                            <table class="table text-start table-bordered table-hover mb-0">
                                <thead id="tableHead">
                                    <tr class="text-dark align-middle">
                                        <th scope="col">Paciente</th>
                                        <th scope="col">Examen</th>
                                        <th scope="col">Fecha</th>
                                        <th scope="col">Diagnóstico</th>
                                        <th scope="col">Estado</th>
                                    </tr>
                                </thead>
                                <tbody id="tableBody"></tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
                <!-- Delete Diagnosis Modal -->
                <div class="modal fade" id="deleteModal" tabindex="-1" aria-labelledby="deleteModalLabel" aria-hidden="true">
                    <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title w-100 text-center" id="deleteTitle">Eliminar Diagnostico</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <form id="deleteForm">
                                    <div class="row">
                                        <div class="mb-2 mb-sm-3 px-4">
                                            <p class="mb-0"><strong>Paciente:</strong> <span id="delModPatient"></span></p>
                                        </div>
                                        <div class="mb-2 mb-sm-3 px-4">
                                            <p class="mb-0"><strong>Examen:</strong> <span id="delModExam"></span></p>
                                        </div>
                                        <div class="mb-2 mb-sm-3 px-4">
                                            <p class="mb-0"><strong>Fecha:</strong> <span id="delModDate"></span></p>
                                        </div>
                                        <div class="alert alert-danger mx-4" role="alert">
                                            Esta accion eliminara el diagnostico. Continuar?
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div class="modal-footer justify-content-center">
                                <button type="submit" class="btn btn-danger" form="deleteForm">Eliminar</button>
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                            </div>
                        </div>
                    </div>
                </div>
<?php require_once APP_ROUTE."/Views/Template/Footer.php"; ?>
