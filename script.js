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
const avisoCompra = document.getElementById("avisoCompra");
const avisoFondo = document.getElementById("avisoFondo");
const avisoCerrar = document.getElementById("avisoCerrar");
const avisoEntendido = document.getElementById("avisoEntendido");
const avisoProducto = document.getElementById("avisoProducto");
const estadoEvento = document.getElementById("estadoEvento");
const avisoDisponibilidad = document.getElementById("avisoDisponibilidad");

const claseEstado = {
    Disponible: "estado-disponible",
    "Pocas unidades": "estado-pocas",
    "No disponible": "estado-no-disponible",
    Agotado: "estado-agotado"
};

const formatoPrecio = valor => `$${valor.toFixed(2)}`;

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

const precioRegularCombo = combo =>
    combo.productos.reduce((total, item) => {
        const producto = productoPorId(item.id);
        return total + (producto ? producto.precio * item.cantidad : 0);
    }, 0);

const imagenesCombo = combo =>
    combo.productos.flatMap(item => {
        const producto = productoPorId(item.id);

        if (!producto) return [];

        return Array.from(
            { length: Math.min(item.cantidad, 2) },
            () => ({
                src: producto.imagen,
                alt: producto.nombre
            })
        );
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
                ${imagenes.map((imagen, posicion) => `
                    <img
                        src="${imagen.src}"
                        alt="${imagen.alt}"
                        loading="lazy"
                        style="--posicion:${posicion}"
                    >
                `).join("")}
            </div>
        </div>

        <div class="combo-contenido">
            <p class="combo-etiqueta">${combo.etiqueta}</p>
            <h3>${combo.nombre}</h3>
            <p class="combo-descripcion">${combo.descripcion}</p>

            <div class="combo-precios">
                <div>
                    <span>Por separado</span>
                    <del>${formatoPrecio(regular)}</del>
                </div>

                <div>
                    <span>Combo</span>
                    <strong>${formatoPrecio(combo.precio)}</strong>
                </div>
            </div>

            <div class="combo-ahorro">
                Ahorras ${formatoPrecio(ahorro)}
            </div>

            <button
                class="boton combo-boton"
                type="button"
                ${estado === "Agotado" ? "disabled" : ""}
            >
                ${estado === "Agotado" ? "Agotado" : 'Lo quiero <span>→</span>'}
            </button>
        </div>
    `;

    const boton = tarjeta.querySelector(".combo-boton");

    if (estado !== "Agotado") {
        boton.addEventListener("click", () => abrirAvisoCompra(combo, estado));
    }

    return tarjeta;
};

const crearPromocion = (promocion, indice) => {
    const tarjeta = document.createElement("article");
    tarjeta.className = "promocion-tarjeta animar-tarjeta";
    tarjeta.style.setProperty("--demora", `${indice * 100}ms`);

    const niveles = promocion.niveles
        ? `
            <div class="promo-niveles">
                ${promocion.niveles.map(nivel => `
                    <div>
                        <span>${nivel.nombre}</span>
                        <strong>${nivel.descuento}</strong>
                    </div>
                `).join("")}
            </div>
        `
        : "";

    tarjeta.innerHTML = `
        <div class="promo-frente">
            <span class="promo-numero">${promocion.numero}</span>
            <span class="promo-puesto">Solo en el puesto</span>

            <div class="promo-titulo">
                <p>Promoción</p>
                <h3>${promocion.titulo}</h3>
            </div>

            <p class="promo-resumen">${promocion.resumen}</p>

            ${niveles}

            <div class="promo-premio">
                <span>Premio</span>
                <strong>${promocion.premio}</strong>
            </div>

            <button class="promo-expandir" type="button" aria-expanded="false">
                <span>Ver condiciones</span>
                <span class="promo-mas">+</span>
            </button>
        </div>

        <div class="promo-condiciones" aria-hidden="true">
            <div>
                <p>Para que sea válida</p>
                <ul>
                    ${promocion.condiciones.map(condicion => `<li>${condicion}</li>`).join("")}
                </ul>
            </div>
        </div>
    `;

    const boton = tarjeta.querySelector(".promo-expandir");
    const condiciones = tarjeta.querySelector(".promo-condiciones");

    boton.addEventListener("click", () => {
        const activa = tarjeta.classList.toggle("activa");
        boton.setAttribute("aria-expanded", String(activa));
        condiciones.setAttribute("aria-hidden", String(!activa));
        boton.querySelector(".promo-mas").textContent = activa ? "−" : "+";
        boton.querySelector("span:first-child").textContent =
            activa ? "Ocultar condiciones" : "Ver condiciones";
    });

    return tarjeta;
};

const mensajesSeleccion = {
    dorilocos: "Tus Dorilocos te estarán esperando. Si llegas antes de que vuelen.",
    nachos: "Los Nachos no se van a comer solos. Mejor llega temprano.",
    soda: "Una soda fría tiene tu nombre. Solo falta que vengas por ella.",
    "combo-antojo": "El Combo Antojo resuelve comida y bebida de una vez.",
    "combo-nacho": "Nachos y soda. Dos problemas menos que decidir.",
    "combo-sin-pensarlo": "Elegiste el más completo. Ahora solo falta llegar antes de que se acabe.",
    "combo-pa-dos": "Pa' los dos necesita dos personas y una sola misión: llegar con hambre."
};

const mostrarDisponibilidadModal = estado => {
    if (estado !== "No disponible") {
        modalDisponibilidad.hidden = true;
        modalDisponibilidad.textContent = "";
        return;
    }

    modalDisponibilidad.hidden = false;
    modalDisponibilidad.textContent =
        "Todavía no está disponible para su compra. Puedes tocar “Lo quiero” para ver cuándo y dónde conseguirlo.";
};

const mostrarDisponibilidadAviso = estado => {
    if (estado !== "No disponible") {
        avisoDisponibilidad.hidden = true;
        avisoDisponibilidad.textContent = "";
        return;
    }

    avisoDisponibilidad.hidden = false;
    avisoDisponibilidad.textContent =
        "No está disponible para su compra todavía. Este aviso solo te muestra dónde y cuándo podrás conseguirlo.";
};

const abrirAvisoCompra = (item, estado = item.estado) => {
    avisoProducto.textContent =
        mensajesSeleccion[item.id] ||
        "Tu antojo te estará esperando.";

    mostrarDisponibilidadAviso(estado);

    if (modal.classList.contains("activo")) {
        cerrarModal();
    }

    setTimeout(() => {
        avisoCompra.classList.add("activo");
        avisoCompra.setAttribute("aria-hidden", "false");
        document.body.classList.add("sin-scroll");

        if (navigator.vibrate) {
            navigator.vibrate(25);
        }
    }, 260);
};

const cerrarAvisoCompra = () => {
    avisoCompra.classList.remove("activo");
    avisoCompra.setAttribute("aria-hidden", "true");
    document.body.classList.remove("sin-scroll");
};

const actualizarEstadoEvento = () => {
    const ahora = new Date();
    const inicio = new Date("2026-08-14T08:00:00-05:00");
    const final = new Date("2026-08-14T12:00:00-05:00");

    if (ahora < inicio) {
        const diferencia = inicio - ahora;
        const dias = Math.floor(diferencia / 86400000);
        const horas = Math.floor((diferencia % 86400000) / 3600000);
        const minutos = Math.floor((diferencia % 3600000) / 60000);

        estadoEvento.textContent =
            dias > 0
                ? `Faltan ${dias}d ${horas}h para abrir`
                : `Faltan ${horas}h ${minutos}min para abrir`;

        estadoEvento.className = "aviso-estado aviso-espera";
        return;
    }

    if (ahora >= inicio && ahora < final) {
        estadoEvento.textContent = "Estamos atendiendo ahora";
        estadoEvento.className = "aviso-estado aviso-abierto";
        return;
    }

    estadoEvento.textContent = "El puesto cerró por hoy";
    estadoEvento.className = "aviso-estado aviso-cerrado";
};

const renderProductos = () => {
    productosContenedor.innerHTML = "";

    productos.forEach((producto, indice) => {
        productosContenedor.appendChild(crearProducto(producto, indice));
    });
};

const renderCombos = () => {
    combosContenedor.innerHTML = "";

    combos.forEach((combo, indice) => {
        combosContenedor.appendChild(crearCombo(combo, indice));
    });
};

const renderPromociones = () => {
    promocionesContenedor.innerHTML = "";

    promociones.forEach((promocion, indice) => {
        promocionesContenedor.appendChild(crearPromocion(promocion, indice));
    });
};

let productoSeleccionado = null;

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
    modalAccion.innerHTML =
        producto.estado === "Agotado"
            ? "Agotado"
            : 'Lo quiero <span>→</span>';

    mostrarDisponibilidadModal(producto.estado);

    modal.classList.add("activo");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("sin-scroll");
    requestAnimationFrame(() => modalCerrar.focus());
};

const cerrarModal = () => {
    modal.classList.remove("activo");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("sin-scroll");
};

const observarTarjetas = () => {
    const observador = new IntersectionObserver(
        entradas => {
            entradas.forEach(entrada => {
                if (!entrada.isIntersecting) return;
                entrada.target.classList.add("visible");
                observador.unobserve(entrada.target);
            });
        },
        { threshold: 0.14 }
    );

    document
        .querySelectorAll(".producto, .animar-tarjeta")
        .forEach(elemento => observador.observe(elemento));
};

const observarElementos = () => {
    const observador = new IntersectionObserver(
        entradas => {
            entradas.forEach(entrada => {
                if (!entrada.isIntersecting) return;
                entrada.target.classList.add("visible");
                observador.unobserve(entrada.target);
            });
        },
        { threshold: 0.12 }
    );

    document.querySelectorAll(".revelar").forEach(elemento => observador.observe(elemento));
};

let ultimoScroll = 0;

const actualizarBarra = () => {
    const actual = window.scrollY;
    barra.classList.toggle("barra-solida", actual > 18);

    if (actual > ultimoScroll && actual > 160) {
        barra.classList.add("barra-oculta");
    } else {
        barra.classList.remove("barra-oculta");
    }

    ultimoScroll = actual;
};

menuBoton.addEventListener("click", () => {
    const abierto = navegacion.classList.toggle("activo");
    menuBoton.classList.toggle("activo", abierto);
    menuBoton.setAttribute("aria-expanded", String(abierto));
});

navegacion.querySelectorAll("a").forEach(enlace => {
    enlace.addEventListener("click", () => {
        navegacion.classList.remove("activo");
        menuBoton.classList.remove("activo");
        menuBoton.setAttribute("aria-expanded", "false");
    });
});

modalFondo.addEventListener("click", cerrarModal);
modalCerrar.addEventListener("click", cerrarModal);

modalAccion.addEventListener("click", () => {
    if (!productoSeleccionado) return;
    if (productoSeleccionado.estado === "Agotado") return;

    abrirAvisoCompra(productoSeleccionado);
});

avisoFondo.addEventListener("click", cerrarAvisoCompra);
avisoCerrar.addEventListener("click", cerrarAvisoCompra);
avisoEntendido.addEventListener("click", cerrarAvisoCompra);

document.addEventListener("keydown", evento => {
    if (evento.key !== "Escape") return;

    if (avisoCompra.classList.contains("activo")) {
        cerrarAvisoCompra();
        return;
    }

    if (modal.classList.contains("activo")) {
        cerrarModal();
    }
});

window.addEventListener("scroll", actualizarBarra, { passive: true });

anio.textContent = `© ${new Date().getFullYear()}`;

actualizarEstadoEvento();

setInterval(
    actualizarEstadoEvento,
    60000
);

renderProductos();
renderCombos();
renderPromociones();
observarTarjetas();
observarElementos();
actualizarBarra();
