console.info("¡Qué Antojo! build ONLINE 2026-08-13.1");
const productosContenedor = document.getElementById("productos");
const combosContenedor = document.getElementById("combosLista");
const promocionesContenedor = document.getElementById("promocionesLista");
const modal = document.getElementById("modal");
const modalFondo = document.getElementById("modalFondo");
const modalCerrar = document.getElementById("modalCerrar");
const modalImagen = document.getElementById("modalImagen");
const modalNombre = document.getElementById("modalNombre");
const modalDescripcion = document.getElementById("modalDescripcion");
const modalPrecio = document.getElementById("modalPrecio");
const modalEstado = document.getElementById("modalEstado");
const modalColor = document.getElementById("modalColor");
const modalAccion = document.getElementById("modalAccion");
const modalDisponibilidad = document.getElementById("modalDisponibilidad");
const menuBoton = document.getElementById("menuBoton");
const navegacion = document.getElementById("navegacion");
const barra = document.getElementById("barra");
const anio = document.getElementById("anio");
const delivery = document.getElementById("delivery");
const deliveryFondo = document.getElementById("deliveryFondo");
const deliveryCerrar = document.getElementById("deliveryCerrar");
const deliveryFormulario = document.getElementById("deliveryFormulario");
const deliveryProductos = document.getElementById("deliveryProductos");
const deliveryTotal = document.getElementById("deliveryTotal");
const deliverySeguimiento = document.getElementById("deliverySeguimiento");
const deliverySubtitulo = document.getElementById("deliverySubtitulo");
const deliveryFinalizar = document.getElementById("deliveryFinalizar");
const seguimientoCodigo = document.getElementById("seguimientoCodigo");
const seguimientoEstado = document.getElementById("seguimientoEstado");
const seguimientoRuta = document.getElementById("seguimientoRuta");
const seguimientoRepartidor = document.getElementById("seguimientoRepartidor");
const seguimientoResumen = document.getElementById("seguimientoResumen");
const seguimientoFinal = document.getElementById("seguimientoFinal");
const seguimientoEspera = document.getElementById("seguimientoEspera");
const seguimientoConexion = document.getElementById("seguimientoConexion");
const deliveryEnviar = document.getElementById("deliveryEnviar");

const claseEstado = {
    Disponible: "estado-disponible",
    "Pocas unidades": "estado-pocas",
    "No disponible": "estado-no-disponible",
    Agotado: "estado-agotado"
};

const formatoPrecio = valor => `$${valor.toFixed(2)}`;
const escapar = valor => String(valor ?? "").replace(/[&<>"']/g, caracter => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
})[caracter]);
const estadoNombre = estado => PedidosStore.estados.find(item => item.id === estado)?.nombre || (estado === "cancelado" ? "Cancelado" : estado);
const productoPorId = id => productos.find(producto => producto.id === id);

const textoEstadoProducto = estado => {
    if (estado === "No disponible") return "Próximamente en el evento";
    if (estado === "Pocas unidades") return "Quedan pocas unidades";
    if (estado === "Agotado") return "Sin unidades por ahora";
    return "Disponible en el evento";
};

const estadoCombo = combo => {
    const estados = combo.productos.map(item => productoPorId(item.id)?.estado);
    if (estados.includes("Agotado")) return "Agotado";
    if (estados.includes("No disponible")) return "No disponible";
    if (estados.includes("Pocas unidades")) return "Pocas unidades";
    return "Disponible";
};

const precioRegularCombo = combo => combo.productos.reduce((total, item) => {
    const producto = productoPorId(item.id);
    return total + (producto ? producto.precio * item.cantidad : 0);
}, 0);

const imagenesCombo = combo => combo.productos.flatMap(item => {
    const producto = productoPorId(item.id);
    if (!producto) return [];
    return Array.from({ length: Math.min(item.cantidad, 2) }, () => ({ src: producto.imagen, alt: producto.nombre }));
});

const crearProducto = (producto, indice) => {
    const tarjeta = document.createElement("article");
    tarjeta.className = `producto producto-${producto.color}${producto.destacado ? " producto-destacado" : ""}`;
    tarjeta.style.setProperty("--demora", `${indice * 90}ms`);
    tarjeta.innerHTML = `
        <button class="producto-boton" type="button" aria-label="Ver ${producto.nombre}">
            <div class="producto-visual">
                <span class="producto-numero">0${indice + 1}</span>
                <span class="estado ${claseEstado[producto.estado]}">${producto.estado}</span>
                <div class="producto-forma"></div>
                <img src="${producto.imagen}" alt="${producto.nombre}" loading="${indice === 0 ? "eager" : "lazy"}">
            </div>
            <div class="producto-info">
                <div>
                    <p>${producto.destacado ? "Favorito del menú" : textoEstadoProducto(producto.estado)}</p>
                    <h3>${producto.nombre}</h3>
                </div>
                <div class="producto-pie">
                    <strong>${formatoPrecio(producto.precio)}</strong>
                    <span class="producto-flecha">↗</span>
                </div>
            </div>
        </button>
    `;
    tarjeta.querySelector(".producto-boton").addEventListener("click", () => abrirModal(producto));
    return tarjeta;
};

const crearCombo = (combo, indice) => {
    const tarjeta = document.createElement("article");
    const regular = precioRegularCombo(combo);
    const ahorro = regular - combo.precio;
    const estado = estadoCombo(combo);
    const imagenes = imagenesCombo(combo);
    tarjeta.className = `combo-tarjeta combo-${combo.color} animar-tarjeta`;
    tarjeta.style.setProperty("--demora", `${indice * 90}ms`);
    tarjeta.innerHTML = `
        <div class="combo-superior">
            <div class="combo-cabecera">
                <span class="combo-numero">0${indice + 1}</span>
                <span class="estado ${claseEstado[estado]}">${estado}</span>
            </div>
            <div class="combo-imagenes">
                ${imagenes.map((imagen, posicion) => `<img src="${imagen.src}" alt="${imagen.alt}" loading="lazy" style="--posicion:${posicion}">`).join("")}
            </div>
        </div>
        <div class="combo-contenido">
            <p class="combo-etiqueta">${combo.etiqueta}</p>
            <h3>${combo.nombre}</h3>
            <p class="combo-descripcion">${combo.descripcion}</p>
            <div class="combo-precios">
                <div><span>Por separado</span><del>${formatoPrecio(regular)}</del></div>
                <div><span>Combo</span><strong>${formatoPrecio(combo.precio)}</strong></div>
            </div>
            <div class="combo-ahorro">Ahorras ${formatoPrecio(ahorro)}</div>
            <button class="boton combo-boton" type="button" ${estado === "Agotado" ? "disabled" : ""}>
                ${estado === "Agotado" ? "Agotado" : 'Lo quiero <span>→</span>'}
            </button>
        </div>
    `;
    const boton = tarjeta.querySelector(".combo-boton");
    if (estado !== "Agotado") boton.addEventListener("click", () => abrirDelivery(combo, "combo"));
    return tarjeta;
};

const crearPromocion = (promocion, indice) => {
    const tarjeta = document.createElement("article");
    tarjeta.className = "promocion-tarjeta animar-tarjeta";
    tarjeta.style.setProperty("--demora", `${indice * 100}ms`);
    const niveles = promocion.niveles ? `
        <div class="promo-niveles">
            ${promocion.niveles.map(nivel => `<div><span>${nivel.nombre}</span><strong>${nivel.descuento}</strong></div>`).join("")}
        </div>
    ` : "";
    tarjeta.innerHTML = `
        <div class="promo-frente">
            <span class="promo-numero">${promocion.numero}</span>
            <span class="promo-puesto">Solo en el puesto</span>
            <div class="promo-titulo"><p>Promoción</p><h3>${promocion.titulo}</h3></div>
            <p class="promo-resumen">${promocion.resumen}</p>
            ${niveles}
            <div class="promo-premio"><span>Premio</span><strong>${promocion.premio}</strong></div>
            <button class="promo-expandir" type="button" aria-expanded="false"><span>Ver condiciones</span><span class="promo-mas">+</span></button>
        </div>
        <div class="promo-condiciones" aria-hidden="true">
            <div><p>Para que sea válida</p><ul>${promocion.condiciones.map(condicion => `<li>${condicion}</li>`).join("")}</ul></div>
        </div>
    `;
    const boton = tarjeta.querySelector(".promo-expandir");
    const condiciones = tarjeta.querySelector(".promo-condiciones");
    boton.addEventListener("click", () => {
        const activa = tarjeta.classList.toggle("activa");
        boton.setAttribute("aria-expanded", String(activa));
        condiciones.setAttribute("aria-hidden", String(!activa));
        boton.querySelector(".promo-mas").textContent = activa ? "−" : "+";
        boton.querySelector("span:first-child").textContent = activa ? "Ocultar condiciones" : "Ver condiciones";
    });
    return tarjeta;
};

const catalogoDelivery = () => [
    ...productos.map(producto => ({ id: producto.id, tipo: "producto", nombre: producto.nombre, precio: producto.precio, imagen: producto.imagen, estado: producto.estado })),
    ...combos.map(combo => ({ id: combo.id, tipo: "combo", nombre: combo.nombre, precio: combo.precio, imagen: productoPorId(combo.productos[0].id)?.imagen || "", estado: estadoCombo(combo) }))
];

let cantidadesDelivery = {};
let pedidoActivoId = localStorage.getItem("queantojo_pedido_activo") || "";
let pedidoActivoActual = pedidoActivoId ? PedidosStore.obtenerCache(pedidoActivoId) : null;
let enviandoPedido = false;
let productoSeleccionado = null;

const calcularDelivery = () => catalogoDelivery().reduce((total, item) => total + item.precio * (cantidadesDelivery[item.id] || 0), 0);

const actualizarDeliveryTotal = () => {
    deliveryTotal.textContent = formatoPrecio(calcularDelivery());
    deliveryProductos.querySelectorAll("[data-cantidad]").forEach(elemento => {
        elemento.textContent = cantidadesDelivery[elemento.dataset.cantidad] || 0;
    });
};

const renderDeliveryProductos = () => {
    deliveryProductos.innerHTML = catalogoDelivery().map(item => `
        <article class="delivery-producto ${item.estado === "Agotado" ? "delivery-producto-agotado" : ""}">
            <img src="${item.imagen}" alt="${item.nombre}">
            <div>
                <span>${item.tipo === "combo" ? "Combo" : "Producto"}</span>
                <strong>${item.nombre}</strong>
                <small>${formatoPrecio(item.precio)}</small>
            </div>
            <div class="delivery-cantidad">
                <button type="button" data-restar="${item.id}" ${item.estado === "Agotado" ? "disabled" : ""}>−</button>
                <span data-cantidad="${item.id}">0</span>
                <button type="button" data-sumar="${item.id}" ${item.estado === "Agotado" ? "disabled" : ""}>+</button>
            </div>
        </article>
    `).join("");

    deliveryProductos.querySelectorAll("[data-sumar]").forEach(boton => boton.addEventListener("click", () => {
        const id = boton.dataset.sumar;
        cantidadesDelivery[id] = Math.min((cantidadesDelivery[id] || 0) + 1, 9);
        actualizarDeliveryTotal();
    }));

    deliveryProductos.querySelectorAll("[data-restar]").forEach(boton => boton.addEventListener("click", () => {
        const id = boton.dataset.restar;
        cantidadesDelivery[id] = Math.max((cantidadesDelivery[id] || 0) - 1, 0);
        actualizarDeliveryTotal();
    }));

    actualizarDeliveryTotal();
};

const abrirDelivery = async (item = null, tipo = "producto") => {
    if (pedidoActivoId) {
        await abrirSeguimiento(pedidoActivoId);
        return;
    }

    if (!PedidosStore.configurado()) {
        deliverySubtitulo.textContent = "El sistema online todavía no está configurado.";
        delivery.classList.add("activo");
        delivery.setAttribute("aria-hidden", "false");
        document.body.classList.add("sin-scroll");
        return;
    }

    try {
        const activo = await PedidosStore.deliveryActivo();
        if (!activo) {
            deliverySubtitulo.textContent = "Los pedidos por delivery están pausados por el momento.";
            delivery.classList.add("activo");
            delivery.setAttribute("aria-hidden", "false");
            document.body.classList.add("sin-scroll");
            return;
        }
    } catch {
        deliverySubtitulo.textContent = "No pudimos confirmar el estado del delivery. Revisa tu conexión e inténtalo de nuevo.";
        delivery.classList.add("activo");
        delivery.setAttribute("aria-hidden", "false");
        document.body.classList.add("sin-scroll");
        return;
    }

    cantidadesDelivery = {};
    if (item) cantidadesDelivery[item.id] = 1;
    renderDeliveryProductos();
    deliveryFormulario.hidden = false;
    deliverySeguimiento.hidden = true;
    deliveryCerrar.hidden = false;
    deliverySubtitulo.textContent = item ? `${item.nombre} ya está seleccionado. Puedes agregar más cosas.` : "Dinos dónde estás y qué quieres pedir.";
    delivery.classList.add("activo");
    delivery.setAttribute("aria-hidden", "false");
    document.body.classList.add("sin-scroll");
};

const cerrarDelivery = () => {
    if (pedidoActivoId) return;
    delivery.classList.remove("activo");
    delivery.setAttribute("aria-hidden", "true");
    document.body.classList.remove("sin-scroll");
};

const pedidoItems = () => catalogoDelivery()
    .filter(item => (cantidadesDelivery[item.id] || 0) > 0)
    .map(item => ({ id: item.id, tipo: item.tipo, nombre: item.nombre, precio: item.precio, cantidad: cantidadesDelivery[item.id] }));

const renderSeguimiento = pedido => {
    if (!pedido) return;
    pedidoActivoActual = pedido;
    seguimientoCodigo.textContent = pedido.id;
    seguimientoEstado.textContent = estadoNombre(pedido.estado);
    seguimientoEstado.className = `seguimiento-estado seguimiento-estado-${pedido.estado}`;

    const indiceActual = PedidosStore.estados.findIndex(estado => estado.id === pedido.estado);
    seguimientoRuta.innerHTML = PedidosStore.estados.map((estado, indice) => {
        const activo = pedido.estado !== "cancelado" && indice <= indiceActual;
        const actual = pedido.estado === estado.id;
        return `<div class="seguimiento-paso ${activo ? "activo" : ""} ${actual ? "actual" : ""}"><span></span><strong>${estado.nombre}</strong></div>`;
    }).join("");

    seguimientoRepartidor.innerHTML = `<span>Repartidor</span><strong>${escapar(pedido.repartidor || "Esperando asignación…")}</strong>`;
    seguimientoResumen.innerHTML = `
        <div><span>Destino</span><strong>${escapar(pedido.salon)} · ${escapar(pedido.bachiller)}</strong></div>
        <div><span>Pago</span><strong>${escapar(pedido.pago)}</strong></div>
        <div><span>Total</span><strong>${formatoPrecio(pedido.total)}</strong></div>
        <div class="seguimiento-resumen-items"><span>Pedido</span><strong>${pedido.items.map(item => `${Number(item.cantidad)}× ${escapar(item.nombre)}`).join(" · ")}</strong></div>
        ${pedido.nota ? `<div class="seguimiento-resumen-items"><span>Detalles</span><strong>${escapar(pedido.nota)}</strong></div>` : ""}
    `;

    const finalizado = pedido.estado === "entregado" || pedido.estado === "cancelado";
    seguimientoEspera.hidden = finalizado;
    seguimientoFinal.hidden = !finalizado;
    deliveryFinalizar.hidden = !finalizado;
    deliveryCerrar.hidden = !finalizado;

    if (finalizado) {
        seguimientoFinal.className = `seguimiento-final seguimiento-final-${pedido.estado}`;
        seguimientoFinal.innerHTML = pedido.estado === "entregado"
            ? `<strong>Pedido entregado</strong><p>Gracias por pedir con ¡Qué Antojo!.</p>`
            : `<strong>Pedido cancelado</strong><p>El staff canceló este pedido. Puedes cerrar esta pantalla y hacer otro si lo necesitas.</p>`;
    }
};

const abrirSeguimiento = async id => {
    const cache = PedidosStore.obtenerCache(id);
    if (cache) {
        pedidoActivoId = id;
        pedidoActivoActual = cache;
        localStorage.setItem("queantojo_pedido_activo", id);
        deliveryFormulario.hidden = true;
        deliverySeguimiento.hidden = false;
        delivery.classList.add("activo");
        delivery.setAttribute("aria-hidden", "false");
        document.body.classList.add("sin-scroll");
        renderSeguimiento(cache);
    }

    try {
        const pedido = await PedidosStore.obtener(id);
        if (!pedido) {
            pedidoActivoId = "";
            pedidoActivoActual = null;
            localStorage.removeItem("queantojo_pedido_activo");
            if (!cache) return;
        } else {
            pedidoActivoId = id;
            pedidoActivoActual = pedido;
            localStorage.setItem("queantojo_pedido_activo", id);
            deliveryFormulario.hidden = true;
            deliverySeguimiento.hidden = false;
            delivery.classList.add("activo");
            delivery.setAttribute("aria-hidden", "false");
            document.body.classList.add("sin-scroll");
            renderSeguimiento(pedido);
        }
    } catch {
        if (!cache) {
            deliveryFormulario.hidden = true;
            deliverySeguimiento.hidden = false;
            delivery.classList.add("activo");
            delivery.setAttribute("aria-hidden", "false");
            document.body.classList.add("sin-scroll");
            seguimientoEstado.textContent = "Reconectando…";
            seguimientoConexion.classList.add("sin-conexion");
            seguimientoConexion.querySelector("strong").textContent = "No pudimos recuperar el pedido todavía.";
        }
    }
};

const abrirModal = producto => {
    productoSeleccionado = producto;
    modalImagen.src = producto.imagen;
    modalImagen.alt = producto.nombre;
    modalNombre.textContent = producto.nombre;
    modalDescripcion.textContent = producto.descripcion;
    modalPrecio.textContent = formatoPrecio(producto.precio);
    modalEstado.textContent = producto.estado;
    modalEstado.className = `estado ${claseEstado[producto.estado]}`;
    modalColor.className = `modal-color modal-color-${producto.color}`;
    modalAccion.disabled = producto.estado === "Agotado";
    modalAccion.innerHTML = producto.estado === "Agotado" ? "Agotado" : 'Lo quiero <span>→</span>';
    modalDisponibilidad.hidden = producto.estado !== "No disponible";
    modalDisponibilidad.textContent = producto.estado === "No disponible" ? "Todavía no está disponible para su compra." : "";
    modal.classList.add("activo");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("sin-scroll");
    requestAnimationFrame(() => modalCerrar.focus());
};

const cerrarModal = () => {
    modal.classList.remove("activo");
    modal.setAttribute("aria-hidden", "true");
    if (!delivery.classList.contains("activo")) document.body.classList.remove("sin-scroll");
};

const renderProductos = () => {
    productosContenedor.innerHTML = "";
    productos.forEach((producto, indice) => productosContenedor.appendChild(crearProducto(producto, indice)));
};

const renderCombos = () => {
    combosContenedor.innerHTML = "";
    combos.forEach((combo, indice) => combosContenedor.appendChild(crearCombo(combo, indice)));
};

const renderPromociones = () => {
    promocionesContenedor.innerHTML = "";
    promociones.forEach((promocion, indice) => promocionesContenedor.appendChild(crearPromocion(promocion, indice)));
};

const observarTarjetas = () => {
    const observador = new IntersectionObserver(entradas => {
        entradas.forEach(entrada => {
            if (!entrada.isIntersecting) return;
            entrada.target.classList.add("visible");
            observador.unobserve(entrada.target);
        });
    }, { threshold: 0.14 });
    document.querySelectorAll(".producto, .animar-tarjeta").forEach(elemento => observador.observe(elemento));
};

const observarElementos = () => {
    const observador = new IntersectionObserver(entradas => {
        entradas.forEach(entrada => {
            if (!entrada.isIntersecting) return;
            entrada.target.classList.add("visible");
            observador.unobserve(entrada.target);
        });
    }, { threshold: 0.12 });
    document.querySelectorAll(".revelar").forEach(elemento => observador.observe(elemento));
};

let ultimoScroll = 0;

const actualizarBarra = () => {
    const actual = window.scrollY;
    barra.classList.toggle("barra-solida", actual > 18);
    if (actual > ultimoScroll && actual > 160) barra.classList.add("barra-oculta");
    else barra.classList.remove("barra-oculta");
    ultimoScroll = actual;
};

menuBoton.addEventListener("click", () => {
    const abierto = navegacion.classList.toggle("activo");
    menuBoton.classList.toggle("activo", abierto);
    menuBoton.setAttribute("aria-expanded", String(abierto));
});

navegacion.querySelectorAll("a").forEach(enlace => enlace.addEventListener("click", () => {
    navegacion.classList.remove("activo");
    menuBoton.classList.remove("activo");
    menuBoton.setAttribute("aria-expanded", "false");
}));

modalFondo.addEventListener("click", cerrarModal);
modalCerrar.addEventListener("click", cerrarModal);
modalAccion.addEventListener("click", () => {
    if (!productoSeleccionado || productoSeleccionado.estado === "Agotado") return;
    cerrarModal();
    setTimeout(() => abrirDelivery(productoSeleccionado, "producto"), 180);
});

deliveryFondo.addEventListener("click", cerrarDelivery);
deliveryCerrar.addEventListener("click", cerrarDelivery);

deliveryFormulario.addEventListener("submit", async evento => {
    evento.preventDefault();
    if (enviandoPedido) return;

    const items = pedidoItems();
    if (!items.length) {
        deliverySubtitulo.textContent = "Selecciona al menos un producto o combo antes de enviar.";
        return;
    }

    const formulario = new FormData(deliveryFormulario);
    enviandoPedido = true;
    deliveryEnviar.disabled = true;
    deliveryEnviar.innerHTML = 'Enviando… <span>↻</span>';
    deliverySubtitulo.textContent = "Conectando con el puesto…";

    try {
        const pedido = await PedidosStore.crear({
            nombre: String(formulario.get("nombre") || "").trim(),
            salon: String(formulario.get("salon") || "").trim(),
            bachiller: String(formulario.get("bachiller") || "").trim(),
            nota: String(formulario.get("nota") || "").trim(),
            pago: String(formulario.get("pago") || "Efectivo"),
            items
        });

        pedidoActivoId = pedido.id;
        pedidoActivoActual = pedido;
        localStorage.setItem("queantojo_pedido_activo", pedido.id);
        await abrirSeguimiento(pedido.id);
    } catch (error) {
        const mensaje = String(error?.message || "");
        if (mensaje.includes("DELIVERY_CERRADO")) {
            deliverySubtitulo.textContent = "El staff pausó temporalmente los pedidos por delivery.";
        } else {
            deliverySubtitulo.textContent = "No pudimos enviar el pedido. Revisa tu Internet e inténtalo otra vez.";
        }
    } finally {
        enviandoPedido = false;
        deliveryEnviar.disabled = false;
        deliveryEnviar.innerHTML = 'Enviar pedido <span>→</span>';
    }
});

deliveryFinalizar.addEventListener("click", () => {
    if (pedidoActivoId) PedidosStore.olvidar(pedidoActivoId);
    pedidoActivoId = "";
    pedidoActivoActual = null;
    localStorage.removeItem("queantojo_pedido_activo");
    delivery.classList.remove("activo");
    delivery.setAttribute("aria-hidden", "true");
    document.body.classList.remove("sin-scroll");
});

PedidosStore.suscribir(async () => {
    if (!pedidoActivoId) return;
    const pedido = await PedidosStore.obtener(pedidoActivoId);
    if (pedido) renderSeguimiento(pedido);
}, { intervalo: 3000, fondo: 8000 });

document.addEventListener("keydown", evento => {
    if (evento.key !== "Escape") return;
    if (delivery.classList.contains("activo")) {
        cerrarDelivery();
        return;
    }
    if (modal.classList.contains("activo")) cerrarModal();
});

window.addEventListener("beforeunload", evento => {
    if (!pedidoActivoId || !pedidoActivoActual) return;
    if (pedidoActivoActual.estado === "entregado" || pedidoActivoActual.estado === "cancelado") return;
    evento.preventDefault();
    evento.returnValue = "";
});

window.addEventListener("pedidos:conexion", evento => {
    if (!seguimientoConexion) return;
    const conectado = evento.detail?.conectado === true;
    seguimientoConexion.classList.toggle("sin-conexion", !conectado);
    seguimientoConexion.querySelector("strong").textContent = conectado
        ? "Conectado al puesto"
        : "Reconectando… los cambios se mostrarán al volver la conexión";
});

window.addEventListener("scroll", actualizarBarra, { passive: true });

anio.textContent = `© ${new Date().getFullYear()}`;

renderProductos();
renderCombos();
renderPromociones();
observarTarjetas();
observarElementos();
actualizarBarra();

if (pedidoActivoId) abrirSeguimiento(pedidoActivoId);
