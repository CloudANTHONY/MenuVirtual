const PedidosStore = (() => {
    const estados = [
        { id: "pendiente", nombre: "Pedido enviado" },
        { id: "aceptado", nombre: "Pedido aceptado" },
        { id: "preparando", nombre: "Preparando" },
        { id: "en_camino", nombre: "En camino" },
        { id: "entregado", nombre: "Entregado" }
    ];

    const claveCredenciales = "queantojo_pedidos_online_v2";
    const claveCache = "queantojo_pedidos_cache_v2";
    const config = window.QueAntojoSupabaseConfig || {};
    let cliente = null;
    let conexionActual = null;
    let staffToken = "";

    const configurado = () =>
        typeof config.url === "string" &&
        typeof config.key === "string" &&
        config.url.startsWith("https://") &&
        config.url.includes(".supabase.co") &&
        config.key.startsWith("sb_publishable_");

    const supabase = () => {
        if (!configurado()) throw new Error("SUPABASE_NO_CONFIGURADO");
        if (!window.supabase?.createClient) throw new Error("SUPABASE_SDK_NO_DISPONIBLE");
        if (!cliente) {
            cliente = window.supabase.createClient(config.url, config.key, {
                auth: {
                    persistSession: false,
                    autoRefreshToken: false,
                    detectSessionInUrl: false
                }
            });
        }
        return cliente;
    };

    const notificarConexion = (conectado, mensaje = "") => {
        if (conexionActual === conectado && !mensaje) return;
        conexionActual = conectado;
        window.dispatchEvent(new CustomEvent("pedidos:conexion", {
            detail: { conectado, mensaje }
        }));
    };

    const leerMapa = clave => {
        try {
            const valor = JSON.parse(localStorage.getItem(clave) || "{}");
            return valor && typeof valor === "object" && !Array.isArray(valor) ? valor : {};
        } catch {
            return {};
        }
    };

    const guardarMapa = (clave, valor) => localStorage.setItem(clave, JSON.stringify(valor));

    const guardarCredencial = (codigo, token) => {
        const mapa = leerMapa(claveCredenciales);
        mapa[codigo] = token;
        guardarMapa(claveCredenciales, mapa);
    };

    const tokenDe = codigo => leerMapa(claveCredenciales)[codigo] || "";

    const olvidar = codigo => {
        const credenciales = leerMapa(claveCredenciales);
        const cache = leerMapa(claveCache);
        delete credenciales[codigo];
        delete cache[codigo];
        guardarMapa(claveCredenciales, credenciales);
        guardarMapa(claveCache, cache);
    };

    const guardarCache = pedido => {
        if (!pedido?.id) return;
        const mapa = leerMapa(claveCache);
        mapa[pedido.id] = pedido;
        guardarMapa(claveCache, mapa);
    };

    const obtenerCache = codigo => leerMapa(claveCache)[codigo] || null;

    const normalizar = (fila, cache = false) => {
        if (!fila) return null;
        const pedido = {
            id: fila.codigo,
            nombre: fila.nombre,
            salon: fila.salon,
            bachiller: fila.bachiller,
            nota: fila.nota || "",
            pago: fila.pago,
            items: Array.isArray(fila.items) ? fila.items : [],
            total: Number(fila.total || 0),
            estado: fila.estado,
            repartidor: fila.repartidor || "",
            creadoEn: fila.creado_en,
            actualizadoEn: fila.actualizado_en
        };
        if (cache) guardarCache(pedido);
        return pedido;
    };

    const esperar = ms => new Promise(resolve => setTimeout(resolve, ms));

    const ejecutar = async tarea => {
        try {
            const resultado = await tarea();
            notificarConexion(true);
            return resultado;
        } catch (error) {
            notificarConexion(false, error?.message || "No se pudo conectar con el puesto");
            throw error;
        }
    };

    const ejecutarConReintentos = async (tarea, intentos = 3) => {
        let ultimoError;
        for (let intento = 0; intento < intentos; intento += 1) {
            try {
                return await ejecutar(tarea);
            } catch (error) {
                ultimoError = error;
                if (intento < intentos - 1) await esperar(500 * (intento + 1));
            }
        }
        throw ultimoError;
    };

    const tokenAleatorio = () => {
        const bytes = new Uint8Array(32);
        crypto.getRandomValues(bytes);
        return Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("");
    };

    const codigoAleatorio = () => {
        const caracteres = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        const bytes = new Uint8Array(8);
        crypto.getRandomValues(bytes);
        return `QA-${Array.from(bytes, byte => caracteres[byte % caracteres.length]).join("")}`;
    };

    const filas = data => Array.isArray(data) ? data : data ? [data] : [];

    const establecerStaffToken = token => {
        staffToken = typeof token === "string" ? token.trim() : "";
    };

    const requiereStaff = () => {
        if (!staffToken) throw new Error("STAFF_SIN_CLAVE");
        return staffToken;
    };

    const crear = async datos => {
        const api = supabase();
        const codigo = codigoAleatorio();
        const token = tokenAleatorio();
        const items = datos.items.map(item => ({
            id: item.id,
            cantidad: item.cantidad
        }));

        const respuesta = await ejecutarConReintentos(async () => {
            const { data, error } = await api.rpc("crear_pedido", {
                p_codigo: codigo,
                p_token: token,
                p_nombre: datos.nombre,
                p_salon: datos.salon,
                p_bachiller: datos.bachiller,
                p_nota: datos.nota || "",
                p_pago: datos.pago,
                p_items: items
            });
            if (error) throw error;
            const fila = filas(data)[0];
            if (!fila) throw new Error("PEDIDO_SIN_RESPUESTA");
            return fila;
        });

        guardarCredencial(codigo, token);
        return normalizar(respuesta, true);
    };

    const obtener = async codigo => {
        const token = tokenDe(codigo);
        if (!token) return null;
        const api = supabase();

        return ejecutar(async () => {
            const { data, error } = await api.rpc("ver_pedido", {
                p_codigo: codigo,
                p_token: token
            });
            if (error) throw error;
            return normalizar(filas(data)[0] || null, true);
        });
    };

    const validarStaff = async () => {
        const api = supabase();
        const token = requiereStaff();
        return ejecutar(async () => {
            const { data, error } = await api.rpc("staff_validar", {
                p_staff_token: token
            });
            if (error) throw error;
            return data === true;
        });
    };

    const listar = async () => {
        const api = supabase();
        const token = requiereStaff();
        return ejecutar(async () => {
            const { data, error } = await api.rpc("staff_listar_pedidos", {
                p_staff_token: token
            });
            if (error) throw error;
            return (data || []).map(fila => normalizar(fila, false));
        });
    };

    const actualizar = async (codigo, cambios) => {
        const api = supabase();
        const token = requiereStaff();
        const estado = typeof cambios.estado === "string" ? cambios.estado : null;
        const repartidor = typeof cambios.repartidor === "string" ? cambios.repartidor.trim() : null;

        return ejecutar(async () => {
            const { data, error } = await api.rpc("staff_actualizar_pedido", {
                p_staff_token: token,
                p_codigo: codigo,
                p_estado: estado,
                p_repartidor: repartidor
            });
            if (error) throw error;
            return normalizar(filas(data)[0] || null, false);
        });
    };

    const limpiar = async () => {
        const api = supabase();
        const token = requiereStaff();
        return ejecutar(async () => {
            const { data, error } = await api.rpc("staff_limpiar_pedidos", {
                p_staff_token: token
            });
            if (error) throw error;
            return data === true;
        });
    };

    const deliveryActivo = async () => {
        const api = supabase();
        return ejecutar(async () => {
            const { data, error } = await api.rpc("estado_delivery");
            if (error) throw error;
            return data === true;
        });
    };

    const cambiarDelivery = async activo => {
        const api = supabase();
        const token = requiereStaff();
        return ejecutar(async () => {
            const { data, error } = await api.rpc("staff_cambiar_estado_delivery", {
                p_staff_token: token,
                p_activo: Boolean(activo)
            });
            if (error) throw error;
            return data === true;
        });
    };

    const salud = async () => {
        const api = supabase();
        return ejecutar(async () => {
            const { data, error } = await api.rpc("salud_queantojo");
            if (error) throw error;
            return data;
        });
    };

    const suscribir = (callback, opciones = {}) => {
        const intervalo = Math.max(1500, Number(opciones.intervalo || 3000));
        const fondo = Math.max(intervalo, Number(opciones.fondo || 8000));
        let detenido = false;
        let ejecutando = false;
        let temporizador = null;

        const programar = () => {
            if (detenido) return;
            const espera = document.visibilityState === "hidden" ? fondo : intervalo;
            temporizador = setTimeout(ejecutarCiclo, espera);
        };

        const ejecutarCiclo = async () => {
            if (detenido) return;
            if (!navigator.onLine) {
                notificarConexion(false, "Sin conexión a Internet");
                programar();
                return;
            }
            if (ejecutando) {
                programar();
                return;
            }
            ejecutando = true;
            try {
                await callback();
            } catch {
            } finally {
                ejecutando = false;
                programar();
            }
        };

        const reanudar = () => {
            if (temporizador) clearTimeout(temporizador);
            ejecutarCiclo();
        };

        document.addEventListener("visibilitychange", reanudar);
        window.addEventListener("online", reanudar);
        window.addEventListener("offline", reanudar);
        ejecutarCiclo();

        return () => {
            detenido = true;
            if (temporizador) clearTimeout(temporizador);
            document.removeEventListener("visibilitychange", reanudar);
            window.removeEventListener("online", reanudar);
            window.removeEventListener("offline", reanudar);
        };
    };

    return {
        estados,
        configurado,
        establecerStaffToken,
        crear,
        obtener,
        obtenerCache,
        validarStaff,
        listar,
        actualizar,
        limpiar,
        olvidar,
        deliveryActivo,
        cambiarDelivery,
        salud,
        suscribir
    };
})();
