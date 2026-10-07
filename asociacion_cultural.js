// ===== REFERENCIAS A LOS ELEMENTOS DEL HTML =====
const eventos = document.querySelectorAll('.evento');        // los tres eventos
const totalSocios = document.getElementById('totalSocios');  // contador de socios
const formulario = document.getElementById('formulario');
const inputNombre = document.getElementById('nombre');
const inputCorreo = document.getElementById('correo');
const selectInteres = document.getElementById('interes');
const mensaje = document.getElementById('mensaje');
const listaSocios = document.getElementById('listaSocios');
// ===== CONSTANTE Y CLAVE DE LOCALSTORAGE =====
const SOCIOS_BASE = 120;          // socios que ya tiene la asociación (ficticio)
const CLAVE = 'asociacion_estado';
// ===== ESTADO POR DEFECTO =====
// reservas: ids de eventos reservados | socios: nuevos inscritos | borrador: lo escrito
const estadoInicial = {
    reservas: [],
    socios: [],
    borrador: { nombre: '', correo: '', interes: 'Taller de danza' }
};
// ===== LEER EL ESTADO GUARDADO =====
function leerEstado() {
    try {
        const guardado = localStorage.getItem(CLAVE);
        // Si hay datos guardados los usamos; si no, partimos del estado inicial
        return guardado ? { ...estadoInicial, ...JSON.parse(guardado) } : { ...estadoInicial };
    } catch (error) {
      return { ...estadoInicial }; // si algo falla, empezamos desde cero
    }
}
// Al cargar la página recuperamos todo lo guardado
let estado = leerEstado();
// ===== GUARDAR EL ESTADO =====
function guardarEstado() {
    localStorage.setItem(CLAVE, JSON.stringify(estado));
}
// ===== MOSTRAR UN MENSAJE DEBAJO DEL FORMULARIO =====
function mostrarMensaje(texto, esExito = false) {
    mensaje.textContent = texto;
    mensaje.classList.toggle('exito', esExito);  // verde si es éxito, rojo si es error
}
// ===== RESERVAR O CANCELAR UN CUPO =====
function alternarReserva(id) {
    if (estado.reservas.includes(id)) {
        estado.reservas = estado.reservas.filter(r => r !== id);  // cancela la reserva
    } else {
        estado.reservas.push(id);                                  // reserva el cupo
    }
    guardarEstado();
    dibujarPantalla();
}
// ===== INSCRIBIR UN NUEVO SOCIO =====
function agregarSocio(evento) {
    evento.preventDefault();  // evita que la página se recargue
    const nombre = inputNombre.value.trim();
    const correo = inputCorreo.value.trim().toLowerCase();
    // Validaciones: si algo está mal, mostramos el error y salimos
    if (nombre.length < 3) return mostrarMensaje('Escribe tu nombre completo.');
    if (!/^\S+@\S+\.\S+$/.test(correo)) return mostrarMensaje('Escribe un correo válido.');
    if (estado.socios.some(s => s.correo === correo)) return mostrarMensaje('Ese correo ya está inscrito.');
    estado.socios.push({ id: Date.now(), nombre, correo, interes: selectInteres.value });
    estado.borrador = { ...estadoInicial.borrador };  // limpiamos el borrador guardado
    guardarEstado();
    formulario.reset();
    mostrarMensaje(`¡Bienvenido, ${nombre}! Ya eres parte de la asociación.`, true);
    dibujarPantalla();
}
// ===== ELIMINAR UN SOCIO =====
function eliminarSocio(id) {
    estado.socios = estado.socios.filter(s => s.id !== id);  // conserva todos menos ese id
    guardarEstado();
    dibujarPantalla();
}
// ===== ACTUALIZAR TODO LO QUE SE VE EN PANTALLA =====
function dibujarPantalla() {
    // Eventos: cupos disponibles y estado del botón
    eventos.forEach(evento => {
        const reservado = estado.reservas.includes(evento.dataset.id);
        const cupos = Number(evento.dataset.cupos) - (reservado ? 1 : 0);  // reservar resta 1 cupo
        evento.classList.toggle('reservado', reservado);
        evento.querySelector('.cupos').textContent = cupos;
        evento.querySelector('[data-reservar]').textContent =
            reservado ? 'Reservado ✓ (cancelar)' : 'Reservar cupo';
    });
    // Contador de socios: los que ya había + los nuevos
    totalSocios.textContent = SOCIOS_BASE + estado.socios.length;
    // Lista de nuevos socios
    listaSocios.innerHTML = '';
    estado.socios.forEach(socio => {
        const item = document.createElement('li');
        const info = document.createElement('div');
        info.innerHTML = '<strong></strong><small></small>';
        info.querySelector('strong').textContent = socio.nombre;
        info.querySelector('small').textContent = `${socio.interes} · ${socio.correo}`;
        const boton = document.createElement('button');
        boton.className = 'btn-eliminar';
        boton.textContent = 'Eliminar';
        boton.addEventListener('click', () => eliminarSocio(socio.id));
        item.append(info, boton);
        listaSocios.appendChild(item);
    });
}
// ===== EVENTOS =====
// Un solo "click" detecta cualquier botón de reservar
document.addEventListener('click', evento => {
    const boton = evento.target.closest('[data-reservar]');
    if (boton) alternarReserva(boton.closest('.evento').dataset.id);
});
formulario.addEventListener('submit', agregarSocio);
// Guarda lo que se escribe en el formulario para no perderlo al refrescar
formulario.addEventListener('input', () => {
    estado.borrador = {
        nombre: inputNombre.value, correo: inputCorreo.value, interes: selectInteres.value
    };
    guardarEstado();
});
// ===== INICIO: se ejecuta al cargar o refrescar la página =====
inputNombre.value = estado.borrador.nombre;      // recupera el borrador del formulario
inputCorreo.value = estado.borrador.correo;
selectInteres.value = estado.borrador.interes;
dibujarPantalla();                               // recupera reservas y socios guardados