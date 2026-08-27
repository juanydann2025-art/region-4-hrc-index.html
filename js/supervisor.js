// =====================================================
// CONFIGURACIÓN
// =====================================================

const URL_APPS_SCRIPT =
"https://script.google.com/macros/s/AKfycbz4aSiP7oXgtImRy6fwZPq2i0ad5rIFwcxa1pDczW79uzhh47FQhWqZ1rUgeQQOUgQ5SQ/exec";




// =====================================================
// SESION
// =====================================================

let usuario = "";
let nombre = "";
let rol = "";


// =====================================================
// RUTAS Y SECCIONES
// =====================================================

const RUTAS = {

    "32": [
        "4953",
        "4954",
        "4955",
        "4962"
    ],

    "33": [
        "5025",
        "5026",
        "5027",
        "5036"
    ],

    "34": [
        "5034",
        "5035",
        "5049",
        "5050"
    ],

    "40": [
        "5078",
        "5079",
        "5080"
    ],

    "41": [
        "5066",
        "5067",
        "5068"
    ],

    "42": [
        "5074",
        "5075",
        "5076",
        "5077"
    ],

    "43": [
        "5069",
        "5070",
        "5071",
        "5072",
        "5073"
    ]

};


// =====================================================
// INICIO
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        usuario =
            String(
                localStorage.getItem("usuario") || ""
            ).trim();


        nombre =
            String(
                localStorage.getItem("nombre") ||
                localStorage.getItem("nombreUsuario") ||
                ""
            ).trim();


        rol =
            String(
                localStorage.getItem("rol") || ""
            ).trim();


        const elementoUsuario =
            document.getElementById(
                "usuarioSupervisor"
            );


        if (elementoUsuario) {

            elementoUsuario.textContent =
                "Usuario: " +
                (nombre || usuario) +
                " | Rol: " +
                rol;

        }


        if (!usuario) {

            alert(
                "No existe una sesion activa."
            );

            window.location.href =
                "index.html";

            return;

        }


        const rolNormalizado =
            rol.toLowerCase().trim();


        if (
            rolNormalizado !== "administrador" &&
            rolNormalizado !== "coordinador"
        ) {

            alert(
                "No tiene permisos para acceder al Panel de Supervision."
            );

            window.location.href =
                "Menu.html";

            return;

        }


        cargarSupervision();

    }
);


// =====================================================
// CARGAR SUPERVISION
// =====================================================

async function cargarSupervision() {

    const tabla =
        document.getElementById(
            "tablaRutas"
        );


    const mensaje =
        document.getElementById(
            "mensaje"
        );


    if (tabla) {

        tabla.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="cargando">

                    <i class="fa-solid fa-spinner fa-spin"></i>

                    Cargando rutas...

                </td>

            </tr>

        `;

    }


    if (mensaje) {

        mensaje.textContent = "";

    }


    try {

        const respuesta =
            await fetch(
                URL_APPS_SCRIPT,
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "text/plain;charset=utf-8"
                    },

                    body:
                        JSON.stringify({

                            accion:
                                "obtenerEstadistica",

                            usuario:
                                usuario,

                            rol:
                                rol

                        })

                }
            );


        const texto =
            await respuesta.text();


        console.log(
            "RESPUESTA SUPERVISION:",
            texto
        );


        if (!texto) {

            throw new Error(
                "El servidor no devolvio informacion."
            );

        }


        let resultado;


        try {

            resultado =
                JSON.parse(texto);

        } catch (error) {

            console.error(
                "RESPUESTA NO JSON:",
                texto
            );

            throw new Error(
                "La respuesta del servidor no es valida."
            );

        }


        if (
            !resultado ||
            resultado.ok !== true
        ) {

            throw new Error(
                resultado &&
                resultado.mensaje
                    ? resultado.mensaje
                    : "No se pudo cargar la estadistica."
            );

        }


        console.log(
            "DATOS RECIBIDOS:",
            resultado
        );


        mostrarTotales(
            resultado.totales || {}
        );


        construirRutas(
            resultado.secciones || []
        );


        if (mensaje) {

            mensaje.textContent =
                "Informacion actualizada correctamente.";

        }

    }

    catch (error) {

        console.error(
            "ERROR SUPERVISION:",
            error
        );


        if (tabla) {

            tabla.innerHTML = `

                <tr>

                    <td
                        colspan="7"
                        class="cargando">

                        <i class="fa-solid fa-triangle-exclamation"></i>

                        <br><br>

                        <strong>
                            No se pudo cargar el Panel de Supervision.
                        </strong>

                        <br><br>

                        ${escaparHTML(error.message)}

                    </td>

                </tr>

            `;

        }


        if (mensaje) {

            mensaje.textContent =
                "Error al cargar la informacion.";

        }

    }

}


// =====================================================
// CONSTRUIR RUTAS
// =====================================================

function construirRutas(secciones) {

    const tabla =
        document.getElementById(
            "tablaRutas"
        );


    if (!tabla) {

        return;

    }


    tabla.innerHTML = "";


    const datosSecciones = {};


    if (Array.isArray(secciones)) {

        secciones.forEach(
            function(item) {

                const seccion =
                    String(
                        item.seccion || ""
                    ).trim();


                if (!seccion) {

                    return;

                }


                datosSecciones[seccion] =
                    item;

            }
        );

    }


    Object.keys(RUTAS).forEach(
        function(ruta) {

            const seccionesRuta =
                RUTAS[ruta];


            let listaNominal = 0;

            let registrados = 0;

            let votaron = 0;

            let pendientes = 0;


            seccionesRuta.forEach(
                function(seccion) {

                    const item =
                        datosSecciones[seccion];


                    if (!item) {

                        return;

                    }


                    listaNominal +=
                        numero(
                            item.listaNominal
                        );


                    registrados +=
                        numero(
                            item.registrados
                        );


                    votaron +=
                        numero(
                            item.votaron
                        );


                    pendientes +=
                        numero(
                            item.pendientes
                        );

                }
            );


            let avance = 0;


            if (listaNominal > 0) {

                avance =
                    (
                        registrados /
                        listaNominal
                    ) * 100;

            }


            avance =
                limitarPorcentaje(
                    avance
                );


            const fila =
                document.createElement(
                    "tr"
                );


            fila.innerHTML = `

                <td>

                    <span class="badge-ruta">

                        <i class="fa-solid fa-route"></i>

                        RUTA ${escaparHTML(ruta)}

                    </span>

                </td>


                <td>

                    <span class="badge-seccion">

                        ${seccionesRuta.join(", ")}

                    </span>

                </td>


                <td class="numero">

                    ${formatearNumero(
                        listaNominal
                    )}

                </td>


                <td class="numero">

                    ${formatearNumero(
                        registrados
                    )}

                </td>


                <td class="porcentaje">

                    <span class="porcentaje-numero">

                        ${avance.toFixed(2)}%

                    </span>

                    <div class="barra">

                        <div
                            class="barra-interior"
                            style="width:${avance}%">

                        </div>

                    </div>

                </td>


                <td class="pendientes">

                    ${formatearNumero(
                        pendientes
                    )}

                </td>


                <td class="votaron">

                    ${formatearNumero(
                        votaron
                    )}

                </td>

            `;


            tabla.appendChild(
                fila
            );

        }
    );

}


// =====================================================
// MOSTRAR TOTALES
// =====================================================

function mostrarTotales(totales) {

    const listaNominal =
        numero(
            totales.listaNominal
        );


    const registrados =
        numero(
            totales.registrados
        );


    const pendientes =
        numero(
            totales.pendientes
        );


    const votaron =
        numero(
            totales.votaron
        );


    let avance = 0;


    if (listaNominal > 0) {

        avance =
            (
                registrados /
                listaNominal
            ) * 100;

    }


    const elementoLista =
        document.getElementById(
            "totalListaNominal"
        );


    const elementoRegistrados =
        document.getElementById(
            "totalRegistrados"
        );


    const elementoPendientes =
        document.getElementById(
            "totalPendientes"
        );


    const elementoVotaron =
        document.getElementById(
            "totalVotaron"
        );


    const elementoAvance =
        document.getElementById(
            "avanceGeneral"
        );


    if (elementoLista) {

        elementoLista.textContent =
            formatearNumero(
                listaNominal
            );

    }


    if (elementoRegistrados) {

        elementoRegistrados.textContent =
            formatearNumero(
                registrados
            );

    }


    if (elementoPendientes) {

        elementoPendientes.textContent =
            formatearNumero(
                pendientes
            );

    }


    if (elementoVotaron) {

        elementoVotaron.textContent =
            formatearNumero(
                votaron
            );

    }


    if (elementoAvance) {

        elementoAvance.textContent =
            limitarPorcentaje(
                avance
            ).toFixed(2) +
            "%";

    }

}


// =====================================================
// NUMERO
// =====================================================

function numero(valor) {

    const n =
        Number(valor);


    if (
        isNaN(n)
    ) {

        return 0;

    }


    return n;

}


// =====================================================
// FORMATEAR NUMERO
// =====================================================

function formatearNumero(valor) {

    const n =
        numero(valor);


    return n.toLocaleString(
        "es-MX"
    );

}


// =====================================================
// LIMITAR PORCENTAJE
// =====================================================

function limitarPorcentaje(valor) {

    let p =
        numero(valor);


    if (p < 0) {

        p = 0;

    }


    if (p > 100) {

        p = 100;

    }


    return p;

}


// =====================================================
// ESCAPAR HTML
// =====================================================

function escaparHTML(valor) {

    if (
        valor === null ||
        valor === undefined
    ) {

        return "";

    }


    return String(valor)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// =====================================================
// REGRESAR AL MENU
// =====================================================

function regresarMenu() {

    window.location.href =
        "Menu.html";

}
