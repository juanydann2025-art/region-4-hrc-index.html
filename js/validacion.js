// ================================================================
// VALIDACIÓN DE REGISTROS
// ================================================================


// ================================================================
// URL APPS SCRIPT
// ================================================================

const URL_APPS_SCRIPT =
    "https://script.google.com/macros/s/AKfycbyQIpdzQUZ5QVmOHxvY5xmA9CHtmF0HIUPy0ewA9fN-G_A273ExbS0kTnjiE7JxHEBHFw/exec";


// ================================================================
// VARIABLES
// ================================================================

let registros = [];

let registroSeleccionado = null;


// ================================================================
// ELEMENTOS
// ================================================================

const cuerpoTabla =
    document.getElementById(
        "cuerpoTabla"
    );


const buscarRegistro =
    document.getElementById(
        "buscarRegistro"
    );


const filtroCategoria =
    document.getElementById(
        "filtroCategoria"
    );


const totalPendientes =
    document.getElementById(
        "totalPendientes"
    );


const totalDuplicados =
    document.getElementById(
        "totalDuplicados"
    );


const mensaje =
    document.getElementById(
        "mensaje"
    );


const modalValidacion =
    document.getElementById(
        "modalValidacion"
    );


const detalleRegistro =
    document.getElementById(
        "detalleRegistro"
    );


const comentarios =
    document.getElementById(
        "comentarios"
    );


const btnValidar =
    document.getElementById(
        "btnValidar"
    );


const btnCancelar =
    document.getElementById(
        "btnCancelar"
    );


const btnCerrarModal =
    document.getElementById(
        "btnCerrarModal"
    );


const btnActualizar =
    document.getElementById(
        "btnActualizar"
    );


// ================================================================
// OBTENER SESIÓN
// ================================================================

function obtenerSesion() {

    try {

        const sesionGuardada =
            localStorage.getItem(
                "sesion"
            );


        if (
            sesionGuardada
        ) {

            return JSON.parse(
                sesionGuardada
            );

        }


        const usuario =
            localStorage.getItem(
                "usuario"
            );


        const nombre =
            localStorage.getItem(
                "nombreUsuario"
            );


        const rol =
            localStorage.getItem(
                "rol"
            );


        if (
            usuario
        ) {

            return {

                usuario:
                    usuario,

                nombre:
                    nombre || "",

                rol:
                    rol || ""

            };

        }


        return null;

    }

    catch (error) {

        console.error(
            error
        );

        return null;

    }

}


// ================================================================
// VERIFICAR SESIÓN
// ================================================================

function verificarSesion() {

    const sesion =
        obtenerSesion();


    if (
        !sesion ||
        !sesion.usuario
    ) {

        mostrarMensaje(
            "No existe una sesión activa.",
            true
        );

        return null;

    }


    if (
        String(
            sesion.rol || ""
        )
        .trim()
        .toLowerCase() !==
        "administrador"
    ) {

        mostrarMensaje(
            "Solo un administrador puede validar registros.",
            true
        );

        return null;

    }


    return sesion;

}


// ================================================================
// MOSTRAR MENSAJE
// ================================================================

function mostrarMensaje(
    texto,
    error = false
) {

    mensaje.textContent =
        texto;


    mensaje.classList.remove(
        "oculto"
    );


    if (error) {

        mensaje.style.background =
            "#fee2e2";

        mensaje.style.color =
            "#991b1b";

    }

    else {

        mensaje.style.background =
            "#dbeafe";

        mensaje.style.color =
            "#1e40af";

    }


    setTimeout(
        function() {

            mensaje.classList.add(
                "oculto"
            );

        },
        5000
    );

}


// ================================================================
// CONTAR DUPLICADOS
// ================================================================

function contarDuplicados(
    lista
) {

    return lista.filter(
        function(registro) {

            return String(
                registro.duplicado || ""
            )
            .trim()
            .toUpperCase() ===
            "SI";

        }
    ).length;

}


// ================================================================
// CARGAR REGISTROS
// ================================================================

async function cargarRegistros() {

    const sesion =
        verificarSesion();


    if (!sesion) {

        return;

    }


    cuerpoTabla.innerHTML = `

        <tr>

            <td colspan="11"
                style="text-align:center;padding:30px">

                Cargando registros...

            </td>

        </tr>

    `;


    try {

        const respuesta =
            await fetch(
                URL_APPS_SCRIPT,
                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "text/plain;charset=utf-8"

                    },

                    body:
                        JSON.stringify({

                            accion:
                                "obtenerRegistrosPendientes",

                            usuario:
                                sesion.usuario

                        })

                }
            );


        const datos =
            await respuesta.json();


        if (
            !datos.ok
        ) {

            throw new Error(
                datos.mensaje ||
                "No fue posible cargar los registros."
            );

        }


        registros =
            Array.isArray(
                datos.registros
            )
                ? datos.registros
                : [];


        totalPendientes.textContent =
            registros.length;


        totalDuplicados.textContent =
            contarDuplicados(
                registros
            );


        mostrarRegistros();

    }

    catch (error) {

        console.error(
            "ERROR:",
            error
        );


        totalPendientes.textContent =
            "0";


        totalDuplicados.textContent =
            "0";


        cuerpoTabla.innerHTML = `

            <tr>

                <td colspan="11"
                    style="text-align:center;padding:30px;color:#991b1b">

                    Error al cargar registros:
                    ${escaparHTML(error.message)}

                </td>

            </tr>

        `;

    }

}


// ================================================================
// MOSTRAR REGISTROS
// ================================================================

function mostrarRegistros() {

    const texto =
        String(
            buscarRegistro.value || ""
        )
        .trim()
        .toLowerCase();


    const categoria =
        String(
            filtroCategoria.value || ""
        )
        .trim()
        .toLowerCase();


    const filtrados =
        registros.filter(
            function(registro) {

                if (
                    categoria &&
                    String(
                        registro.categoria || ""
                    )
                    .toLowerCase() !==
                    categoria
                ) {

                    return false;

                }


                if (!texto) {

                    return true;

                }


                const contenido =
                    [

                        registro.folio,

                        registro.categoria,

                        registro.fecha,

                        registro.usuario,

                        registro.nombreUsuario,

                        registro.nombre,

                        registro.seccion,

                        registro.comunidad,

                        registro.calle,

                        registro.numero,

                        registro.tipo,

                        registro.usuarioDuplicado,

                        registro.duplicadoConUsuario

                    ]
                    .join(" ")
                    .toLowerCase();


                return contenido.includes(
                    texto
                );

            }
        );


    // ============================================================
    // ACTUALIZAR CONTADORES
    // ============================================================

    totalPendientes.textContent =
        filtrados.length;


    totalDuplicados.textContent =
        contarDuplicados(
            filtrados
        );


    if (
        filtrados.length === 0
    ) {

        cuerpoTabla.innerHTML = `

            <tr>

                <td colspan="11"
                    style="text-align:center;padding:30px">

                    No hay registros pendientes.

                </td>

            </tr>

        `;

        return;

    }


    cuerpoTabla.innerHTML =
        filtrados
            .map(
                crearFila
            )
            .join("");

}


// ================================================================
// CREAR FILA
// ================================================================

function crearFila(
    registro
) {

    const duplicado =
        String(
            registro.duplicado || "NO"
        )
        .trim()
        .toUpperCase();


    const claseDuplicado =
        duplicado === "SI"
            ? "duplicado-si"
            : "duplicado-no";


    const textoDuplicado =
        duplicado === "SI"
            ? "SÍ"
            : "NO";


    return `

        <tr>

            <td>
                <strong>
                    ${escaparHTML(
                        registro.folio
                    )}
                </strong>
            </td>


            <td>
                ${escaparHTML(
                    registro.categoria
                )}
            </td>


            <td>
                ${escaparHTML(
                    registro.fecha
                )}
            </td>


            <td>
                ${escaparHTML(
                    registro.usuario
                )}
            </td>


            <td>
                ${escaparHTML(
                    registro.nombre ||
                    registro.nombreUsuario ||
                    ""
                )}
            </td>


            <td>
                ${escaparHTML(
                    registro.seccion
                )}
            </td>


            <td>
                ${escaparHTML(
                    registro.comunidad
                )}
            </td>


            <td>

                <span class="${claseDuplicado}">

                    ${textoDuplicado}

                </span>

            </td>


            <td>

                ${escaparHTML(
                    registro.duplicadoConUsuario ||
                    ""
                )}

            </td>


            <td>

                <span style="color:#777">

                    Pendiente

                </span>

            </td>


            <td>

                <button
                    class="btn-tabla"
                    onclick="abrirValidacion('${escaparAtributo(
                        registro.folio
                    )}','${escaparAtributo(
                        registro.categoria
                    )}')">

                    Revisar

                </button>

            </td>

        </tr>

    `;

}


// ================================================================
// ABRIR VALIDACIÓN
// ================================================================

function abrirValidacion(
    folio,
    categoria
) {

    const registro =
        registros.find(
            function(item) {

                return String(
                    item.folio
                ) ===
                String(
                    folio
                ) &&
                String(
                    item.categoria
                ) ===
                String(
                    categoria
                );

            }
        );


    if (!registro) {

        mostrarMensaje(
            "No se encontró el registro.",
            true
        );

        return;

    }


    registroSeleccionado =
        registro;


    mostrarDetalle(
        registro
    );


    comentarios.value =
        registro.comentarios ||
        "";


    modalValidacion.classList.remove(
        "oculto"
    );

}


// ================================================================
// MOSTRAR DETALLE
// ================================================================

function mostrarDetalle(
    registro
) {

    const datos =
        Object.entries(
            registro
        );


    detalleRegistro.innerHTML =
        datos
            .filter(
                function([clave]) {

                    return (
                        clave !==
                        "comentarios"
                    );

                }
            )
            .map(
                function([
                    clave,
                    valor
                ]) {

                    return `

                        <div class="detalle-item">

                            <strong>
                                ${escaparHTML(
                                    formatearEtiqueta(
                                        clave
                                    )
                                )}
                            </strong>

                            <span>
                                ${escaparHTML(
                                    valor
                                )}
                            </span>

                        </div>

                    `;

                }
            )
            .join("");

}


// ================================================================
// FORMATEAR ETIQUETA
// ================================================================

function formatearEtiqueta(
    texto
) {

    return String(
        texto || ""
    )
    .replace(
        /([A-Z])/g,
        " $1"
    )
    .replace(
        /^./,
        function(letra) {

            return letra.toUpperCase();

        }
    );

}


// ================================================================
// VALIDAR
// ================================================================

async function validarRegistro() {

    if (
        !registroSeleccionado
    ) {

        return;

    }


    const sesion =
        verificarSesion();


    if (!sesion) {

        return;

    }


    const confirmar =
        confirm(
            "¿Está seguro de validar este registro?\n\nUna vez validado desaparecerá de la lista de pendientes."
        );


    if (!confirmar) {

        return;

    }


    btnValidar.disabled =
        true;


    btnValidar.textContent =
        "Validando...";


    try {

        const respuesta =
            await fetch(
                URL_APPS_SCRIPT,
                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "text/plain;charset=utf-8"

                    },

                    body:
                        JSON.stringify({

                            accion:
                                "validarRegistro",

                            usuario:
                                sesion.usuario,

                            categoria:
                                registroSeleccionado.categoria,

                            folio:
                                registroSeleccionado.folio,

                            comentarios:
                                comentarios.value.trim()

                        })

                }
            );


        const datos =
            await respuesta.json();


        if (
            !datos.ok
        ) {

            throw new Error(
                datos.mensaje ||
                "No se pudo validar."
            );

        }


        cerrarModal();


        mostrarMensaje(
            "Registro validado correctamente."
        );


        await cargarRegistros();

    }

    catch (error) {

        console.error(
            error
        );


        mostrarMensaje(
            error.message,
            true
        );

    }

    finally {

        btnValidar.disabled =
            false;

        btnValidar.textContent =
            "✓ Validar registro";

    }

}


// ================================================================
// CERRAR MODAL
// ================================================================

function cerrarModal() {

    modalValidacion.classList.add(
        "oculto"
    );


    registroSeleccionado =
        null;


    comentarios.value =
        "";

}


// ================================================================
// ESCAPAR HTML
// ================================================================

function escaparHTML(
    valor
) {

    if (
        valor === null ||
        valor === undefined
    ) {

        return "";

    }


    return String(
        valor
    )
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


// ================================================================
// ESCAPAR ATRIBUTO
// ================================================================

function escaparAtributo(
    valor
) {

    return String(
        valor || ""
    )
    .replace(
        /\\/g,
        "\\\\"
    )
    .replace(
        /'/g,
        "\\'"
    );

}


// ================================================================
// EVENTOS
// ================================================================

buscarRegistro.addEventListener(
    "input",
    mostrarRegistros
);


filtroCategoria.addEventListener(
    "change",
    mostrarRegistros
);


btnActualizar.addEventListener(
    "click",
    cargarRegistros
);


btnValidar.addEventListener(
    "click",
    validarRegistro
);


btnCancelar.addEventListener(
    "click",
    cerrarModal
);


btnCerrarModal.addEventListener(
    "click",
    cerrarModal
);


// ================================================================
// CERRAR AL HACER CLICK FUERA
// ================================================================

modalValidacion.addEventListener(
    "click",
    function(evento) {

        if (
            evento.target ===
            modalValidacion
        ) {

            cerrarModal();

        }

    }
);


// ================================================================
// INICIAR
// ================================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        cargarRegistros();

    }
);