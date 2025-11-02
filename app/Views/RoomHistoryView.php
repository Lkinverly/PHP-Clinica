<?php require_once APP_ROUTE."/Views/Template/Header.php"; ?>
<div id="content">
    <!-- Título -->
    <div class="container-fluid pt-4 px-4">
        <div class="row">
            <div id="iconClassTitle" class="col-12 col-sm-5 mb-0">
                <div class="bg-transparent rounded d-flex align-items-center px-2">
                    <i id="moduleIcon"></i>
                    <h4 id="moduleTitle" class="mb-0"></h4>
                </div>
            </div>
        </div>
    </div>

    <!-- Resumen por habitación -->
    <div class="container-fluid pt-4 px-4">
        <div class="row" id="roomsHistoryCards"></div>
    </div>

    <!-- Historial detallado por habitación -->
    <div class="container-fluid pt-4 px-4">
        <div class="row" id="roomsHistoryTables"></div>
    </div>
</div>
<?php require_once APP_ROUTE."/Views/Template/Footer.php"; ?>
