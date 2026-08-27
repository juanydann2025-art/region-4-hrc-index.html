// ========================================
// OBTENER ROL DEL USUARIO
// ========================================

const rolUsuario =
    (
        localStorage.getItem("rol") || ""
    )
    .trim()
    .toLowerCase();


// ========================================
// OCULTAR ELEMENTO
// ========================================

function ocultar(id) {

    const elemento =
        document.getElementById(id);

    if (elemento) {

        elemento.style.display =
            "none";

    }

}


// ========================================
// VERIFICAR PERMISOS
// ========================================

window.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "ROL DEL USUARIO:",
            rolUsuario
        );


        // ==================================
        // ADMINISTRADOR
        // ==================================

        if (
            rolUsuario ===
            "administrador"
        ) {

            return;

        }


        // ==================================
        // COORDINADOR
        // ==================================

        if (
            rolUsuario ===
            "coordinador"
        ) {

            ocultar(
                "btnUsuarios"
            );

            return;

        }


        // ==================================
        // BRIGADISTA
        // ==================================

        if (
            rolUsuario ===
            "brigadista"
        ) {

            ocultar(
                "btnUsuarios"
            );

            ocultar(
                "btnEstadisticas"
            );

            ocultar(
                "btnConfiguracion"
            );

            ocultar(
                "btnInformes"
            );

            ocultar(
                "btnSupervision"
            );

            return;

        }


        // ==================================
        // CUALQUIER OTRO ROL
        // ==================================

        ocultar(
            "btnUsuarios"
        );

        ocultar(
            "btnEstadisticas"
        );

        ocultar(
            "btnConfiguracion"
        );

        ocultar(
            "btnInformes"
        );

        ocultar(
            "btnSupervision"
        );

    }
);