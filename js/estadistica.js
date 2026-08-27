// =====================================================
// CONFIGURACIÓN
// =====================================================

const URL_APPS_SCRIPT =
"https://script.google.com/macros/s/AKfycbz4aSiP7oXgtImRy6fwZPq2i0ad5rIFwcxa1pDczW79uzhh47FQhWqZ1rUgeQQOUgQ5SQ/exec";


// =====================================================
// VARIABLES
// =====================================================

let usuario = "";
let nombre = "";
let rol = "";

const META_USUARIO = 90;

let usuariosOriginales = [];


// =====================================================
// INICIAR
// =====================================================

document.addEventListener("DOMContentLoaded", function () {

    usuario = String(
        localStorage.getItem("usuario") || ""
    ).trim();

    nombre = String(
        localStorage.getItem("nombre") ||
        localStorage.getItem("nombreUsuario") ||
        ""
    ).trim();

    rol = String(
        localStorage.getItem("rol") || ""
    ).trim();


    const elementoUsuario =
        document.getElementById("usuarioEstadistica");


    if (elementoUsuario) {

        elementoUsuario.textContent =
            nombre
                ? nombre + " · " + rol
                : usuario;

    }


    if (!usuario) {

        alert("No existe una sesión activa.");

        window.location.href = "index.html";

        return;

    }


    if (rol.toLowerCase() !== "administrador") {

        alert(
            "No tiene permisos para acceder a Estadísticas."
        );

        window.location.href = "Menu.html";

        return;

    }


    cargarEstadistica();

});


// =====================================================
// CARGAR ESTADÍSTICA
// =====================================================

async function cargarEstadistica() {

    const tablaSecciones =
        document.getElementById("tablaSecciones");

    const tablaUsuarios =
        document.getElementById("tablaUsuarios");

    const mensaje =
        document.getElementById("mensaje");


    if (tablaSecciones) {

        tablaSecciones.innerHTML = `
            <tr>
                <td colspan="8" class="cargando">
                    <i class="fa-solid fa-spinner fa-spin"></i>
                    Cargando secciones...
                </td>
            </tr>
        `;

    }


    if (tablaUsuarios) {

        tablaUsuarios.innerHTML = `
            <tr>
                <td colspan="8" class="cargando">
                    <i class="fa-solid fa-spinner fa-spin"></i>
                    Cargando usuarios...
                </td>
            </tr>
        `;

    }


    try {

        const respuesta = await fetch(
            URL_APPS_SCRIPT,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "text/plain;charset=utf-8"
                },

                body: JSON.stringify({

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
            "RESPUESTA ESTADISTICA:",
            texto
        );


        if (!texto) {

            throw new Error(
                "El servidor no devolvió información."
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
                "La respuesta del Apps Script no es válida."
            );

        }


        if (resultado.ok !== true) {

            throw new Error(
                resultado.mensaje ||
                "No se pudieron obtener las estadísticas."
            );

        }


        console.log(
            "DATOS RECIBIDOS:",
            resultado
        );


        // =================================================
        // SECCIONES
        // =================================================

        mostrarSecciones(
            resultado.secciones || []
        );


        // =================================================
        // USUARIOS
        // =================================================

        usuariosOriginales =
            Array.isArray(resultado.usuarios)
                ? resultado.usuarios
                : [];


        mostrarUsuarios(
            usuariosOriginales
        );


        // =================================================
        // TOTALES
        // =================================================

        mostrarTotales(
            resultado.totales || {}
        );


        if (mensaje) {

            mensaje.textContent =
                "Estadísticas actualizadas correctamente.";

        }

    }

    catch (error) {

        console.error(
            "ERROR ESTADISTICAS:",
            error
        );


        if (tablaSecciones) {

            tablaSecciones.innerHTML = `
                <tr>
                    <td colspan="8" class="cargando">
                        Error al cargar las secciones.
                    </td>
                </tr>
            `;

        }


        if (tablaUsuarios) {

            tablaUsuarios.innerHTML = `
                <tr>
                    <td colspan="8" class="cargando">
                        Error al cargar los usuarios.
                    </td>
                </tr>
            `;

        }


        if (mensaje) {

            mensaje.textContent =
                "Error: " + error.message;

        }

    }

}


// =====================================================
// MOSTRAR SECCIONES
// =====================================================

function mostrarSecciones(secciones) {

    const tabla =
        document.getElementById("tablaSecciones");


    if (!tabla) {
        return;
    }


    tabla.innerHTML = "";


    if (
        !Array.isArray(secciones) ||
        secciones.length === 0
    ) {

        tabla.innerHTML = `
            <tr>
                <td colspan="8" class="cargando">
                    No hay información de secciones.
                </td>
            </tr>
        `;

        return;

    }


    secciones.forEach(function (item) {

        const ruta =
            String(item.ruta || "-");


        const seccion =
            String(item.seccion || "-");


        const listaNominal =
            Number(item.listaNominal) || 0;


        const registrados =
            Number(item.registrados) || 0;


        const porcentajeRegistrados =
            Number(item.porcentajeRegistrados) || 0;


        const votaron =
            Number(item.votaron) || 0;


        const porcentajeVotaron =
            Number(item.porcentajeVotaron) || 0;


        const pendientes =
            Number(item.pendientes) || 0;


        const barraRegistrados =
            Math.min(
                Math.max(
                    porcentajeRegistrados,
                    0
                ),
                100
            );


        const barraVotaron =
            Math.min(
                Math.max(
                    porcentajeVotaron,
                    0
                ),
                100
            );


        const fila =
            document.createElement("tr");


        fila.innerHTML = `

            <td class="celda-ruta">

                <span class="badge-ruta">

                    <i class="fa-solid fa-route"></i>

                    ${escaparHTML(ruta)}

                </span>

            </td>


            <td>

                <span class="badge-seccion">

                    <i class="fa-solid fa-location-dot"></i>

                    ${escaparHTML(seccion)}

                </span>

            </td>


            <td class="numero">

                ${formatoNumero(listaNominal)}

            </td>


            <td class="numero">

                ${formatoNumero(registrados)}

            </td>


            <td class="porcentaje">

                <span class="porcentaje-numero">

                    ${porcentajeRegistrados.toFixed(2)}%

                </span>

                <div class="barra">

                    <div
                        class="barra-interior"
                        style="width:${barraRegistrados}%">
                    </div>

                </div>

            </td>


            <td class="votaron">

                ${formatoNumero(votaron)}

            </td>


            <td class="porcentaje">

                <span class="porcentaje-numero">

                    ${porcentajeVotaron.toFixed(2)}%

                </span>

                <div class="barra">

                    <div
                        class="barra-interior"
                        style="width:${barraVotaron}%">
                    </div>

                </div>

            </td>


            <td class="pendientes">

                ${formatoNumero(pendientes)}

            </td>

        `;


        tabla.appendChild(fila);

    });

}


// =====================================================
// MOSTRAR USUARIOS
// =====================================================

function mostrarUsuarios(usuarios) {

    const tabla =
        document.getElementById("tablaUsuarios");


    if (!tabla) {
        return;
    }


    tabla.innerHTML = "";


    if (
        !Array.isArray(usuarios) ||
        usuarios.length === 0
    ) {

        tabla.innerHTML = `
            <tr>
                <td colspan="8" class="cargando">
                    No existen registros por usuario.
                </td>
            </tr>
        `;

        return;

    }


    usuarios.forEach(function (item) {

        const registros =
            Number(item.registros) || 0;


        const avance =
            Math.min(
                (registros / META_USUARIO) * 100,
                100
            );


        const votaron =
            Number(item.votaron) || 0;


        const pendientes =
            Number(item.pendientes) || 0;


        const ultimoRegistro =
            item.ultimoRegistro ||
            "Sin registros";


        const dias =
            calcularDiasSinRegistrar(
                item.ultimoRegistro
            );


        const fila =
            document.createElement("tr");


        if (dias >= 3) {

            fila.classList.add(
                "registro-atrasado"
            );

        }


        fila.innerHTML = `

            <td>

                <span class="usuario-login">

                    <i class="fa-solid fa-user"></i>

                    ${escaparHTML(item.usuario)}

                </span>

            </td>


            <td class="usuario-nombre">

                ${escaparHTML(item.nombre || "")}

            </td>


            <td class="meta">

                ${META_USUARIO}

                <span class="meta-pequena">
                    registros
                </span>

            </td>


            <td class="numero">

                ${formatoNumero(registros)}

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


            <td class="votaron">

                ${formatoNumero(votaron)}

            </td>


            <td class="pendientes">

                ${formatoNumero(pendientes)}

            </td>


            <td class="ultimo-registro">

                ${escaparHTML(ultimoRegistro)}

            </td>

        `;


        tabla.appendChild(fila);

    });

}


// =====================================================
// BUSCAR USUARIO
// =====================================================

function buscarUsuario() {

    const campo =
        document.getElementById(
            "buscarUsuario"
        );


    if (!campo) {
        return;
    }


    const texto =
        String(campo.value || "")
            .trim()
            .toLowerCase();


    if (!texto) {

        mostrarUsuarios(
            usuariosOriginales
        );

        return;

    }


    const filtrados =
        usuariosOriginales.filter(
            function (item) {

                const usuarioItem =
                    String(
                        item.usuario || ""
                    ).toLowerCase();


                const nombreItem =
                    String(
                        item.nombre || ""
                    ).toLowerCase();


                return (
                    usuarioItem.includes(texto) ||
                    nombreItem.includes(texto)
                );

            }
        );


    mostrarUsuarios(
        filtrados
    );

}


// =====================================================
// LIMPIAR BÚSQUEDA
// =====================================================

function limpiarBusquedaUsuario() {

    const campo =
        document.getElementById(
            "buscarUsuario"
        );


    if (campo) {

        campo.value = "";

    }


    mostrarUsuarios(
        usuariosOriginales
    );

}


// =====================================================
// MOSTRAR TOTALES
// =====================================================

function mostrarTotales(totales) {

    if (!totales) {
        return;
    }


    const totalNominal =
        Number(totales.listaNominal) || 0;


    const totalRegistrados =
        Number(totales.registrados) || 0;


    const totalPendientes =
        Number(totales.pendientes) || 0;


    const totalVotaron =
        Number(totales.votaron) || 0;


    const porcentaje =
        Number(
            totales.porcentajeRegistrados
        ) || 0;


    const elementoNominal =
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


    const barra =
        document.getElementById(
            "avanceGeneralBarra"
        );


    if (elementoNominal) {

        elementoNominal.textContent =
            formatoNumero(
                totalNominal
            );

    }


    if (elementoRegistrados) {

        elementoRegistrados.textContent =
            formatoNumero(
                totalRegistrados
            );

    }


    if (elementoPendientes) {

        elementoPendientes.textContent =
            formatoNumero(
                totalPendientes
            );

    }


    if (elementoVotaron) {

        elementoVotaron.textContent =
            formatoNumero(
                totalVotaron
            );

    }


    if (elementoAvance) {

        elementoAvance.textContent =
            porcentaje.toFixed(2) +
            "%";

    }


    if (barra) {

        const ancho =
            Math.min(
                Math.max(
                    porcentaje,
                    0
                ),
                100
            );


        barra.style.width =
            ancho + "%";

    }

}


// =====================================================
// CALCULAR DÍAS
// =====================================================

function calcularDiasSinRegistrar(fechaTexto) {

    if (!fechaTexto) {
        return 999;
    }


    const texto =
        String(fechaTexto).trim();


    let fecha;


    const partesFecha =
        texto.split(" ")[0];


    if (
        /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(
            partesFecha
        )
    ) {

        const partes =
            partesFecha.split("/");


        fecha =
            new Date(
                Number(partes[2]),
                Number(partes[1]) - 1,
                Number(partes[0])
            );

    }

    else {

        fecha =
            new Date(fechaTexto);

    }


    if (isNaN(fecha.getTime())) {
        return 999;
    }


    const hoy =
        new Date();


    hoy.setHours(
        0,
        0,
        0,
        0
    );


    fecha.setHours(
        0,
        0,
        0,
        0
    );


    const diferencia =
        hoy.getTime() -
        fecha.getTime();


    return Math.floor(
        diferencia /
        (
            1000 *
            60 *
            60 *
            24
        )
    );

}


// =====================================================
// FORMATO NÚMERO
// =====================================================

function formatoNumero(valor) {

    const numero =
        Number(valor);


    if (isNaN(numero)) {
        return "0";
    }


    return numero.toLocaleString(
        "es-MX"
    );

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
// ABRIR DASHBOARD POR USUARIO
// =====================================================

function abrirDashboardUsuario(){

window.location.href =
    "dashboardUsuario.html";

}

// =====================================================
// REGRESAR AL MENÚ
// =====================================================

function regresarMenu(){

window.location.href =
    "Menu.html";

}

// =====================================================
// REGRESAR
// =====================================================

function regresarMenu() {

    window.location.href =
        "Menu.html";

}