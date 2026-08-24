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

window.onload =
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

            // Tiene acceso a todo

            return;

        }


        // ==================================
        // COORDINADOR
        // ==================================

        if (
            rolUsuario ===
            "coordinador"
        ) {

            // No puede administrar usuarios

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

            // No puede administrar usuarios

            ocultar(
                "btnUsuarios"
            );


            // No puede ver estadísticas

            ocultar(
                "btnEstadisticas"
            );


            // No puede ver configuración

            ocultar(
                "btnConfiguracion"
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

    };