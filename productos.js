const productos = [
    {
        id: "dorilocos",
        nombre: "Dorilocos",
        descripcion: "Dorilocos preparados con carne, queso, guacamole, pico de gallo y maíz. Puedes añadir o quitar salsas al pedir.",
        precio: 2.00,
        imagen: "assets/dorilocos.png",
        estado: "Disponible",
        color: "rojo",
        destacado: true
    },
    {
        id: "nachos",
        nombre: "Nachos",
        descripcion: "Nachos crujientes cubiertos con queso y preparados para servirte algo rápido, abundante y lleno de sabor.",
        precio: 1.50,
        imagen: "assets/nachos.png",
        estado: "Disponible",
        color: "amarillo",
        destacado: false
    },
    {
        id: "soda",
        nombre: "Sodas",
        descripcion: "Sodas bien frías: Coca-Cola, Sprite y Fresca, sujetas a disponibilidad.",
        precio: 0.75,
        imagen: "assets/soda.png",
        estado: "Disponible",
        color: "verde",
        destacado: false
    }
];

const combos = [
    {
        id: "combo-antojo",
        nombre: "Combo Antojo",
        descripcion: "Un Doriloco acompañado de una soda bien fría.",
        precio: 2.50,
        productos: [
            { id: "dorilocos", cantidad: 1 },
            { id: "soda", cantidad: 1 }
        ],
        etiqueta: "El clásico",
        color: "rojo"
    },
    {
        id: "combo-nacho",
        nombre: "Combo Nachero",
        descripcion: "Nachos con una soda para resolver el antojo completo.",
        precio: 2.00,
        productos: [
            { id: "nachos", cantidad: 1 },
            { id: "soda", cantidad: 1 }
        ],
        etiqueta: "Ligero y completo",
        color: "amarillo"
    },
    {
        id: "combo-sin-pensarlo",
        nombre: "No lo pienses",
        descripcion: "Doriloco, Nachos y Soda. El combo para cuando elegir uno solo no era opción.",
        precio: 3.75,
        productos: [
            { id: "dorilocos", cantidad: 1 },
            { id: "nachos", cantidad: 1 },
            { id: "soda", cantidad: 1 }
        ],
        etiqueta: "El más completo",
        color: "negro"
    },
    {
        id: "combo-pa-dos",
        nombre: "Pa' los dos",
        descripcion: "Un Doriloco, unos Nachos y dos sodas para compartir el antojo.",
        precio: 4.50,
        productos: [
            { id: "dorilocos", cantidad: 1 },
            { id: "nachos", cantidad: 1 },
            { id: "soda", cantidad: 2 }
        ],
        etiqueta: "Para compartir",
        color: "verde"
    }
];

const promociones = [
    {
        id: "promo-amigos",
        numero: "01",
        titulo: "Ven con la banda",
        resumen: "Llega con 3 amigos, compren juntos y conviertan la visita en un Doriloco gratis.",
        premio: "1 Doriloco GRATIS",
        ambito: "Solo en el puesto",
        condiciones: [
            "Deben estar presentes las 4 personas en el puesto.",
            "Cada integrante del grupo debe realizar una compra mínima de $1.50.",
            "El Doriloco gratis se entrega después de completar las 4 compras.",
            "Máximo un Doriloco gratis por grupo.",
            "Sujeto a disponibilidad de inventario.",
            "No acumulable con la promoción de preguntas."
        ]
    },
    {
        id: "promo-preguntas",
        numero: "02",
        titulo: "¿Te la sabes?",
        resumen: "Responde correctamente una pregunta. En el puesto puedes ganar hasta 50%; por delivery también puedes intentarlo al recibir tu pedido.",
        premio: "Puesto hasta 50% · Delivery hasta 15%",
        ambito: "Puesto + Delivery",
        niveles: [
            { nombre: "Fácil", descuento: "10%" },
            { nombre: "Media", descuento: "25%" },
            { nombre: "Reto", descuento: "50%" }
        ],
        condiciones: [
            "En el puesto: fácil 10%, media 25% y reto 50%.",
            "En delivery: fácil 5%, media 10% y difícil 15%.",
            "Si pediste delivery, indícale al repartidor que quieres intentar la pregunta antes de pagar.",
            "Una oportunidad por persona.",
            "Sin ayuda de internet ni de otras personas durante la respuesta.",
            "El descuento se valida por el personal antes de completar el pago.",
            "No acumulable con otra promoción."
        ]
    },
    {
        id: "promo-tempranero",
        numero: "03",
        titulo: "Tempranero gana",
        resumen: "Haz tu compra entre 9:00 AM y 9:30 AM y llévate una soda por solo $0.50.",
        premio: "Soda a $0.50",
        ambito: "Solo en el puesto",
        condiciones: [
            "Válida únicamente entre 9:00 AM y 9:30 AM.",
            "Debes comprar al menos un Doriloco, unos Nachos o cualquier combo.",
            "Aplica a una sola soda por compra.",
            "La promoción se valida únicamente en el puesto.",
            "No acumulable con descuentos por preguntas."
        ]
    },
    {
        id: "promo-combo-fiel",
        numero: "04",
        titulo: "Combo premiado",
        resumen: "Compra cualquier combo y recibe $0.25 de descuento adicional en una soda extra.",
        premio: "$0.25 OFF en soda extra",
        ambito: "Solo en el puesto",
        condiciones: [
            "Debes comprar cualquier combo del menú.",
            "El descuento aplica únicamente a una soda adicional.",
            "La soda extra debe comprarse en la misma transacción.",
            "Solo se valida en el puesto de comida.",
            "Sujeto a disponibilidad de sodas."
        ]
    },
    {
        id: "promo-selfie",
        numero: "05",
        titulo: "Selfie del antojo",
        resumen: "Tómate una foto en el puesto con tu compra y recibe un cupón de $0.25 para usar en el momento.",
        premio: "Cupón de $0.25",
        ambito: "Solo en el puesto",
        condiciones: [
            "La foto debe tomarse en el puesto al momento de la compra.",
            "Debes mostrar la foto al personal para validar el cupón.",
            "El cupón se usa ese mismo día y en la misma jornada del evento.",
            "Aplica sobre una compra mínima de $1.50.",
            "No acumulable con la promoción de grupo ni con descuentos de preguntas."
        ]
    },
    {
        id: "promo-panfleto",
        numero: "06",
        titulo: "Trae el panfleto",
        resumen: "Presenta el panfleto físico de promoción y recibe un 5% de descuento en tu compra.",
        premio: "5% de descuento",
        ambito: "Puesto + Delivery",
        condiciones: [
            "Debes presentar el panfleto físico al personal.",
            "En delivery, muéstraselo al repartidor antes de realizar el pago.",
            "El descuento se aplica al subtotal de comida; el costo de delivery no se descuenta.",
            "Válido una vez por pedido.",
            "No acumulable con otra promoción."
        ]
    }
];