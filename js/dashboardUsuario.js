
// =====================================================
// CONFIGURACIÓN
// =====================================================


const URL_APPS_SCRIPT =
"https://script.google.com/macros/s/AKfycbz4aSiP7oXgtImRy6fwZPq2i0ad5rIFwcxa1pDczW79uzhh47FQhWqZ1rUgeQQOUgQ5SQ/exec";


// =====================================================
// SESIÓN
// =====================================================

let usuarioSesion = "";
let rolSesion = "";


// =====================================================
// META
// =====================================================

const META_USUARIO = 90;


// =====================================================
// TODOS LOS USUARIOS
// =====================================================

let todosLosUsuarios = [];


// =====================================================
// INICIAR
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function(){

        usuarioSesion =
            String(
                localStorage.getItem("usuario") || ""
            ).trim();


        rolSesion =
            String(
                localStorage.getItem("rol") || ""
            ).trim();


        const nombreSesion =
            String(
                localStorage.getItem("nombre") ||
                localStorage.getItem("nombreUsuario") ||
                ""
            ).trim();


        const elementoUsuario =
            document.getElementById(
                "usuarioEstadistica"
            );


        if(elementoUsuario){

            elementoUsuario.textContent =
                nombreSesion
                ? nombreSesion + " · " + rolSesion
                : usuarioSesion;

        }


        // =================================================
        // VALIDAR SESIÓN
        // =================================================

        if(!usuarioSesion){

            alert(
                "No existe una sesión activa."
            );

            window.location.href =
                "index.html";

            return;

        }


        // =================================================
        // VALIDAR ADMINISTRADOR
        // =================================================

        if(
            rolSesion.toLowerCase() !==
            "administrador"
        ){

            alert(
                "No tiene permisos para acceder."
            );

            window.location.href =
                "Menu.html";

            return;

        }


        // =================================================
        // BUSCADOR ENTER
        // =================================================

        const input =
            document.getElementById(
                "buscarUsuario"
            );


        if(input){

            input.addEventListener(
                "keydown",
                function(event){

                    if(
                        event.key === "Enter"
                    ){

                        buscarUsuario();

                    }

                }
            );


            input.addEventListener(
                "input",
                function(){

                    filtrarUsuarios(
                        input.value
                    );

                }
            );

        }


        // =================================================
        // CARGAR TODOS
        // =================================================

        cargarUsuarios();

    }
);


// =====================================================
// CARGAR USUARIOS
// =====================================================

async function cargarUsuarios(){

    const tabla =
        document.getElementById(
            "tablaUsuarios"
        );


    const contador =
        document.getElementById(
            "contadorUsuarios"
        );


    const mensaje =
        document.getElementById(
            "mensaje"
        );


    if(tabla){

        tabla.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    class="cargando">

                    <i
                        class="fa-solid fa-spinner fa-spin">
                    </i>

                    Cargando usuarios...

                </td>

            </tr>

        `;

    }


    if(contador){

        contador.textContent =
            "Cargando usuarios...";

    }


    try{

        const respuesta =
            await fetch(
                URL_APPS_SCRIPT,
                {

                    method:
                        "POST",

                    headers:{
                        "Content-Type":
                            "text/plain;charset=utf-8"
                    },

                    body:
                        JSON.stringify({

                            accion:
                                "obtenerEstadistica",

                            usuario:
                                usuarioSesion,

                            rol:
                                rolSesion

                        })

                }
            );


        const texto =
            await respuesta.text();


        console.log(
            "RESPUESTA DASHBOARD:",
            texto
        );


        if(!texto){

            throw new Error(
                "El servidor no devolvió información."
            );

        }


        let resultado;


        try{

            resultado =
                JSON.parse(
                    texto
                );

        }

        catch(error){

            console.error(
                "RESPUESTA NO JSON:",
                texto
            );

            throw new Error(
                "La respuesta del servidor no es válida."
            );

        }


        if(
            resultado.ok !== true
        ){

            throw new Error(
                resultado.mensaje ||
                "No se pudieron obtener los usuarios."
            );

        }


        todosLosUsuarios =
            Array.isArray(
                resultado.usuarios
            )
            ? resultado.usuarios
            : [];


        console.log(
            "USUARIOS RECIBIDOS:",
            todosLosUsuarios
        );


        // =================================================
        // ORDENAR
        // =================================================

        todosLosUsuarios.sort(
            function(a,b){

                const nombreA =
                    normalizar(
                        a.nombre ||
                        a.usuario
                    );


                const nombreB =
                    normalizar(
                        b.nombre ||
                        b.usuario
                    );


                return nombreA.localeCompare(
                    nombreB
                );

            }
        );


        // =================================================
        // MOSTRAR TODOS
        // =================================================

        mostrarUsuarios(
            todosLosUsuarios
        );


        if(contador){

            contador.textContent =
                todosLosUsuarios.length +
                (
                    todosLosUsuarios.length === 1
                    ? " usuario encontrado"
                    : " usuarios encontrados"
                );

        }


        if(mensaje){

            mensaje.textContent =
                "Lista de usuarios cargada correctamente.";

        }

    }

    catch(error){

        console.error(
            "ERROR DASHBOARD:",
            error
        );


        if(tabla){

            tabla.innerHTML = `

                <tr>

                    <td
                        colspan="8"
                        class="cargando">

                        <i
                            class="fa-solid fa-triangle-exclamation">
                        </i>

                        Error al cargar usuarios:
                        ${escaparHTML(error.message)}

                    </td>

                </tr>

            `;

        }


        if(contador){

            contador.textContent =
                "No se pudieron cargar los usuarios.";

        }


        if(mensaje){

            mensaje.textContent =
                "Error: " +
                error.message;

        }

    }

}


// =====================================================
// BUSCAR / FILTRAR
// =====================================================

function buscarUsuario(){

    const input =
        document.getElementById(
            "buscarUsuario"
        );


    if(!input){

        return;

    }


    filtrarUsuarios(
        input.value
    );

}


// =====================================================
// FILTRAR USUARIOS
// =====================================================

function filtrarUsuarios(
    texto
){

    const buscado =
        normalizar(
            texto
        );


    if(!buscado){

        mostrarUsuarios(
            todosLosUsuarios
        );

        actualizarContador(
            todosLosUsuarios.length
        );

        return;

    }


    const encontrados =
        todosLosUsuarios.filter(
            function(item){

                const usuario =
                    normalizar(
                        item.usuario
                    );


                const nombre =
                    normalizar(
                        item.nombre
                    );


                return (
                    usuario.includes(
                        buscado
                    ) ||
                    nombre.includes(
                        buscado
                    )
                );

            }
        );


    mostrarUsuarios(
        encontrados
    );


    actualizarContador(
        encontrados.length,
        true
    );

}


// =====================================================
// CONTADOR
// =====================================================

function actualizarContador(
    cantidad,
    filtrado
){

    const contador =
        document.getElementById(
            "contadorUsuarios"
        );


    if(!contador){

        return;

    }


    if(filtrado){

        contador.textContent =
            cantidad +
            (
                cantidad === 1
                ? " usuario encontrado"
                : " usuarios encontrados"
            );

    }

    else{

        contador.textContent =
            cantidad +
            (
                cantidad === 1
                ? " usuario"
                : " usuarios"
            );

    }

}


// =====================================================
// MOSTRAR USUARIOS
// =====================================================

function mostrarUsuarios(
    usuarios
){

    const tabla =
        document.getElementById(
            "tablaUsuarios"
        );


    if(!tabla){

        return;

    }


    tabla.innerHTML =
        "";


    if(
        !Array.isArray(usuarios) ||
        usuarios.length === 0
    ){

        tabla.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    class="cargando">

                    <i
                        class="fa-solid fa-user-xmark">
                    </i>

                    No se encontraron usuarios.

                </td>

            </tr>

        `;

        return;

    }


    usuarios.forEach(
        function(item){

            const registros =
                Number(
                    item.registros
                ) || 0;


            const votaron =
                Number(
                    item.votaron
                ) || 0;


            const pendientes =
                Number(
                    item.pendientes
                ) || 0;


            // =================================================
            // AVANCE
            // =================================================

            const avance =
                Math.min(
                    Math.max(
                        (
                            registros /
                            META_USUARIO
                        ) * 100,
                        0
                    ),
                    100
                );


            // =================================================
            // ÚLTIMO REGISTRO
            // =================================================

            const ultimoRegistro =
                item.ultimoRegistro ||
                "Sin registros";


            // =================================================
            // DÍAS
            // =================================================

            const dias =
                calcularDiasSinRegistrar(
                    item.ultimoRegistro
                );


            const fila =
                document.createElement(
                    "tr"
                );


            // =================================================
            // MARCAR ATRASADO
            // =================================================

            if(
                registros > 0 &&
                dias >= 3
            ){

                fila.classList.add(
                    "registro-atrasado"
                );

            }


            // =================================================
            // HTML
            // =================================================

            fila.innerHTML = `

                <td>

                    <span class="usuario-login">

                        <i
                            class="fa-solid fa-user">
                        </i>

                        ${escaparHTML(
                            item.usuario ||
                            ""
                        )}

                    </span>

                </td>


                <td class="usuario-nombre">

                    ${escaparHTML(
                        item.nombre ||
                        ""
                    )}

                </td>


                <td class="meta">

                    ${formatoNumero(
                        META_USUARIO
                    )}

                    <span class="meta-pequena">

                        registros

                    </span>

                </td>


                <td class="registros">

                    ${formatoNumero(
                        registros
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


                <td class="votaron">

                    ${formatoNumero(
                        votaron
                    )}

                </td>


                <td class="pendientes">

                    ${formatoNumero(
                        pendientes
                    )}

                </td>


                <td>

                    ${escaparHTML(
                        ultimoRegistro
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
// CALCULAR DÍAS SIN REGISTRO
// =====================================================

function calcularDiasSinRegistrar(
    fechaTexto
){

    if(
        !fechaTexto
    ){

        return 999;

    }


    const texto =
        String(
            fechaTexto
        ).trim();


    let fecha;


    const partesFecha =
        texto.split(" ")[0];


    // =================================================
    // FORMATO DD/MM/YYYY
    // =================================================

    if(
        /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(
            partesFecha
        )
    ){

        const partes =
            partesFecha.split("/");


        fecha =
            new Date(
                Number(partes[2]),
                Number(partes[1]) - 1,
                Number(partes[0])
            );

    }

    else{

        fecha =
            new Date(
                fechaTexto
            );

    }


    if(
        isNaN(
            fecha.getTime()
        )
    ){

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
// NORMALIZAR
// =====================================================

function normalizar(
    valor
){

    return String(
        valor || ""
    )
    .toLowerCase()
    .normalize(
        "NFD"
    )
    .replace(
        /[\u0300-\u036f]/g,
        ""
    )
    .trim();

}


// =====================================================
// FORMATO NÚMERO
// =====================================================

function formatoNumero(
    valor
){

    const numero =
        Number(
            valor
        );


    if(
        isNaN(numero)
    ){

        return "0";

    }


    return numero.toLocaleString(
        "es-MX"
    );

}


// =====================================================
// ESCAPAR HTML
// =====================================================

function escaparHTML(
    valor
){

    if(
        valor === null ||
        valor === undefined
    ){

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
// REGRESAR AL MENÚ
// =====================================================

function regresarMenu(){

    window.location.href =
        "Menu.html";

}