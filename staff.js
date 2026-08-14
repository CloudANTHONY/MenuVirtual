const staffAcceso = document.getElementById("staffAcceso");
const staffAccesoTitulo = document.getElementById("staffAccesoTitulo");
const staffAccesoTexto = document.getElementById("staffAccesoTexto");
const staffAccesoError = document.getElementById("staffAccesoError");
const staffApp = document.getElementById("staffApp");
const staffSalir = document.getElementById("staffSalir");
const staffSenal = document.getElementById("staffSenal");
const staffPedidos = document.getElementById("staffPedidos");
const staffDetalle = document.getElementById("staffDetalle");
const contadorPendientes = document.getElementById("contadorPendientes");
const contadorActivos = document.getElementById("contadorActivos");
const contadorFinalizados = document.getElementById("contadorFinalizados");
const staffLimpiar = document.getElementById("staffLimpiar");
const staffDeliveryTexto = document.getElementById("staffDeliveryTexto");
const staffDeliveryToggle = document.getElementById("staffDeliveryToggle");

const claveSesionStaff = "queantojo_staff_session_v1";
let pedidoSeleccionado = "";
let pedidosActuales = [];
let cargandoPedidos = false;
let cancelarSuscripcion = null;
let deliveryActivoActual = null;
let accionEnCurso = false;

const formatoPrecio = valor => `$${Number(valor || 0).toFixed(2)}`;
const estadoNombre = estado => PedidosStore.estados.find(item => item.id === estado)?.nombre || (estado === "cancelado" ? "Cancelado" : estado);
const esFinal = estado => estado === "entregado" || estado === "cancelado";
const hora = valor => new Intl.DateTimeFormat("es-PA", { hour: "numeric", minute: "2-digit" }).format(new Date(valor));
const escapar = valor => String(valor ?? "").replace(/[&<>"']/g, caracter => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
})[caracter]);

const mostrarConexion = conectado => {
    staffSenal.classList.toggle("sin-conexion", !conectado);
    staffSenal.innerHTML = conectado
        ? "<span></span>Online"
        : "<span></span>Reconectando";
};

const renderContadores = pedidos => {
    contadorPendientes.textContent = pedidos.filter(pedido => pedido.estado === "pendiente").length;
    contadorActivos.textContent = pedidos.filter(pedido => !esFinal(pedido.estado) && pedido.estado !== "pendiente").length;
    contadorFinalizados.textContent = pedidos.filter(pedido => esFinal(pedido.estado)).length;
};

const renderLista = (actualizarDetalle = true) => {
    renderContadores(pedidosActuales);

    if (!pedidosActuales.length) {
        staffPedidos.innerHTML = `<div class="staff-sin-pedidos"><span>0</span><strong>No hay pedidos todavía</strong><p>Cuando un cliente envíe uno aparecerá aquí.</p></div>`;
        if (actualizarDetalle) renderDetalle();
        return;
    }

    staffPedidos.innerHTML = pedidosActuales.map(pedido => `
        <button class="staff-pedido ${pedidoSeleccionado === pedido.id ? "seleccionado" : ""}" data-pedido="${escapar(pedido.id)}" type="button">
            <div class="staff-pedido-superior">
                <strong>${escapar(pedido.id)}</strong>
                <span class="staff-chip staff-chip-${escapar(pedido.estado)}">${escapar(estadoNombre(pedido.estado))}</span>
            </div>
            <h3>${escapar(pedido.nombre)}</h3>
            <p>${escapar(pedido.salon)} · ${escapar(pedido.bachiller)}</p>
            <div class="staff-pedido-pie">
                <span>${pedido.items.reduce((total, item) => total + Number(item.cantidad || 0), 0)} artículos · ${escapar(pedido.pago)}</span>
                <strong>${formatoPrecio(pedido.total)}</strong>
            </div>
        </button>
    `).join("");

    staffPedidos.querySelectorAll("[data-pedido]").forEach(boton => boton.addEventListener("click", () => {
        pedidoSeleccionado = boton.dataset.pedido;
        renderLista(false);
        renderDetalle();
    }));

    if (actualizarDetalle) renderDetalle();
};

const renderDetalle = () => {
    const pedido = pedidosActuales.find(item => item.id === pedidoSeleccionado) || null;
    if (!pedido) {
        pedidoSeleccionado = "";
        staffDetalle.innerHTML = `<div class="staff-vacio"><span>↗</span><h2>Selecciona un pedido</h2><p>Aquí podrás asignar repartidor y actualizar el estado.</p></div>`;
        return;
    }

    const bloqueAsignacion = pedido.repartidor
        ? `<div class="staff-repartidor-asignado"><span>Repartidor</span><strong>${escapar(pedido.repartidor)}</strong></div>`
        : `<form class="staff-repartidor-form" id="staffRepartidorForm"><label><span>Repartidor</span><input id="staffRepartidor" type="text" maxlength="50" required placeholder="Nombre de quien entregará"></label><button type="submit">Tomar pedido</button></form>`;

    const estados = PedidosStore.estados.filter(estado => estado.id !== "pendiente");
    const controles = esFinal(pedido.estado) ? "" : `
        <div class="staff-estados">
            <span>Actualizar pedido</span>
            <div>
                ${estados.map(estado => `<button type="button" data-estado="${estado.id}" ${!pedido.repartidor ? "disabled" : ""} class="${pedido.estado === estado.id ? "activo" : ""}">${estado.nombre}</button>`).join("")}
                <button type="button" data-estado="cancelado" ${!pedido.repartidor ? "disabled" : ""} class="staff-cancelar">Cancelar</button>
            </div>
        </div>
    `;

    staffDetalle.innerHTML = `
        <div class="staff-detalle-cabecera">
            <div><span>${hora(pedido.creadoEn)}</span><strong>${escapar(pedido.id)}</strong></div>
            <span class="staff-chip staff-chip-${escapar(pedido.estado)}">${escapar(estadoNombre(pedido.estado))}</span>
        </div>

        <div class="staff-cliente">
            <span>Entregar a</span>
            <h2>${escapar(pedido.nombre)}</h2>
            <p>${escapar(pedido.salon)} · ${escapar(pedido.bachiller)}</p>
        </div>

        <div class="staff-items">
            ${pedido.items.map(item => `<div><span>${Number(item.cantidad)}×</span><strong>${escapar(item.nombre)}</strong><b>${formatoPrecio(Number(item.precio) * Number(item.cantidad))}</b></div>`).join("")}
        </div>

        ${pedido.nota ? `<div class="staff-nota"><span>Detalles</span><strong>${escapar(pedido.nota)}</strong></div>` : ""}

        <div class="staff-total">
            <div><span>Método de pago</span><strong>${escapar(pedido.pago)}</strong></div>
            <div><span>Total</span><strong>${formatoPrecio(pedido.total)}</strong></div>
        </div>

        ${bloqueAsignacion}
        ${controles}
    `;

    const formulario = document.getElementById("staffRepartidorForm");
    if (formulario) formulario.addEventListener("submit", async evento => {
        evento.preventDefault();
        const nombre = document.getElementById("staffRepartidor").value.trim();
        if (!nombre) return;
        const boton = formulario.querySelector("button");
        boton.disabled = true;
        boton.textContent = "Asignando…";
        accionEnCurso = true;
        try {
            await PedidosStore.tomarPedido(pedido.id, nombre);
            await cargarPedidos(true);
        } catch (error) {
            console.error("[Qué Antojo] No se pudo tomar el pedido", error);
            boton.disabled = false;
            boton.textContent = "Reintentar";
            alert(`No se pudo tomar el pedido. ${error?.message || "Revisa la conexión."}`);
        } finally {
            accionEnCurso = false;
        }
    });

    staffDetalle.querySelectorAll("[data-estado]").forEach(boton => boton.addEventListener("click", async () => {
        const estado = boton.dataset.estado;
        if (!pedido.repartidor) return;
        boton.disabled = true;
        accionEnCurso = true;
        try {
            await PedidosStore.cambiarEstadoPedido(pedido.id, estado);
            await cargarPedidos(true);
        } catch (error) {
            console.error("[Qué Antojo] No se pudo cambiar el estado", error);
            boton.disabled = false;
            alert(`No se pudo cambiar el estado. ${error?.message || "Revisa la conexión."}`);
        } finally {
            accionEnCurso = false;
        }
    }));
};

const cargarDelivery = async () => {
    try {
        deliveryActivoActual = await PedidosStore.deliveryActivo();
        staffDeliveryTexto.textContent = deliveryActivoActual ? "Aceptando pedidos" : "Pedidos pausados";
        staffDeliveryToggle.textContent = deliveryActivoActual ? "Pausar pedidos" : "Reabrir pedidos";
        staffDeliveryToggle.classList.toggle("cerrado", !deliveryActivoActual);
        staffDeliveryToggle.disabled = false;
    } catch {
        staffDeliveryTexto.textContent = "Sin conexión";
        staffDeliveryToggle.disabled = true;
    }
};

const cargarPedidos = async (forzarDetalle = false) => {
    if (cargandoPedidos) return;
    cargandoPedidos = true;
    try {
        const editandoRepartidor = document.activeElement?.id === "staffRepartidor";
        pedidosActuales = await PedidosStore.listar();
        mostrarConexion(true);
        renderLista(forzarDetalle || (!editandoRepartidor && !accionEnCurso));
    } catch (error) {
        mostrarConexion(false);
        if (String(error?.message || "").includes("STAFF_NO_AUTORIZADO")) cerrarPanel();
    } finally {
        cargandoPedidos = false;
    }
};

const mostrarAcceso = (titulo, texto, error = "") => {
    staffApp.hidden = true;
    staffAcceso.hidden = false;
    staffAccesoTitulo.textContent = titulo;
    staffAccesoTexto.textContent = texto;
    staffAccesoError.hidden = !error;
    staffAccesoError.textContent = error;
};

const mostrarApp = async () => {
    staffAcceso.hidden = true;
    staffApp.hidden = false;
    await cargarDelivery();
    await cargarPedidos();
    if (cancelarSuscripcion) cancelarSuscripcion();
    cancelarSuscripcion = PedidosStore.suscribir(cargarPedidos, { intervalo: 2000, fondo: 6000 });
};

const extraerClave = () => {
    const parametros = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const recibida = String(parametros.get("s") || "").trim();
    if (recibida) {
        sessionStorage.setItem(claveSesionStaff, recibida);
        history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
        return recibida;
    }
    return String(sessionStorage.getItem(claveSesionStaff) || "").trim();
};

const cerrarPanel = () => {
    if (cancelarSuscripcion) cancelarSuscripcion();
    cancelarSuscripcion = null;
    sessionStorage.removeItem(claveSesionStaff);
    PedidosStore.establecerStaffToken("");
    pedidoSeleccionado = "";
    pedidosActuales = [];
    mostrarAcceso("Acceso privado cerrado", "Para volver a entrar abre nuevamente el enlace privado del staff.");
};

const iniciar = async () => {
    if (!PedidosStore.configurado()) {
        mostrarAcceso("Falta configuración", "Supabase todavía no está configurado.", "Revisa supabase-config.js.");
        return;
    }

    const token = extraerClave();
    if (!token) {
        mostrarAcceso("Enlace privado requerido", "Este panel no usa usuario ni contraseña. Debes abrirlo desde el enlace privado del staff.");
        return;
    }

    PedidosStore.establecerStaffToken(token);
    mostrarAcceso("Verificando acceso…", "Conectando con el sistema de pedidos.");

    try {
        const valido = await PedidosStore.validarStaff();
        if (!valido) {
            sessionStorage.removeItem(claveSesionStaff);
            PedidosStore.establecerStaffToken("");
            mostrarAcceso("Enlace no válido", "El enlace de staff no coincide con la clave configurada.");
            return;
        }
        await mostrarApp();
    } catch {
        mostrarAcceso("No pudimos conectar", "Comprueba tu Internet y vuelve a abrir el enlace privado del staff.");
    }
};

staffSalir.addEventListener("click", cerrarPanel);

staffDeliveryToggle.addEventListener("click", async () => {
    if (deliveryActivoActual === null) return;
    staffDeliveryToggle.disabled = true;
    try {
        await PedidosStore.cambiarDelivery(!deliveryActivoActual);
        await cargarDelivery();
    } catch {
        staffDeliveryToggle.disabled = false;
    }
});

staffLimpiar.addEventListener("click", async () => {
    if (!confirm("¿Vaciar todos los pedidos? Hazlo solo antes de comenzar una nueva jornada.")) return;
    if (!confirm("Esta acción elimina también los pedidos finalizados. ¿Continuar?")) return;
    try {
        await PedidosStore.limpiar();
        pedidoSeleccionado = "";
        await cargarPedidos();
    } catch {
        alert("No se pudieron eliminar los pedidos. Revisa la conexión.");
    }
});

window.addEventListener("pedidos:conexion", evento => mostrarConexion(evento.detail?.conectado === true));

iniciar();
