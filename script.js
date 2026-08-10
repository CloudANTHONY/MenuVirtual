const productosContenedor = document.getElementById("productos");
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
const menuBoton = document.getElementById("menuBoton");
const navegacion = document.getElementById("navegacion");
const barra = document.getElementById("barra");
const anio = document.getElementById("anio");

const claseEstado = {
    Disponible: "estado-disponible",
    "Pocas unidades": "estado-pocas",
    Agotado: "estado-agotado"
};

const formatoPrecio = valor => `$${valor.toFixed(2)}`;

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
                    <p>${producto.destacado ? "Favorito del menú" : "Disponible en el evento"}</p>
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

const renderProductos = () => {
    productosContenedor.innerHTML = "";

    productos.forEach((producto, indice) => {
        productosContenedor.appendChild(crearProducto(producto, indice));
    });

    observarProductos();
};

const abrirModal = producto => {
    modalImagen.src = producto.imagen;
    modalImagen.alt = producto.nombre;
    modalNombre.textContent = producto.nombre;
    modalDescripcion.textContent = producto.descripcion;
    modalPrecio.textContent = formatoPrecio(producto.precio);
    modalEstado.textContent = producto.estado;
    modalEstado.className = `estado ${claseEstado[producto.estado]}`;
    modalColor.className = `modal-color modal-color-${producto.color}`;
    modalAccion.disabled = producto.estado === "Agotado";
    modalAccion.textContent = producto.estado === "Agotado" ? "Agotado" : "Lo quiero";
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

const observarProductos = () => {
    const observador = new IntersectionObserver(
        entradas => {
            entradas.forEach(entrada => {
                if (!entrada.isIntersecting) return;
                entrada.target.classList.add("visible");
                observador.unobserve(entrada.target);
            });
        },
        { threshold: 0.16 }
    );

    document.querySelectorAll(".producto").forEach(producto => observador.observe(producto));
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

document.addEventListener("keydown", evento => {
    if (evento.key === "Escape" && modal.classList.contains("activo")) {
        cerrarModal();
    }
});

window.addEventListener("scroll", actualizarBarra, { passive: true });

anio.textContent = `© ${new Date().getFullYear()}`;

renderProductos();
observarElementos();
actualizarBarra();
