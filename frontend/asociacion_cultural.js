//---------------------------------------//
//--|funcionalidad_asociacion_cultural|--//
//---------------------------------------//
const eventos = document.querySelectorAll('.evento');
const totalSocios = document.getElementById('totalSocios');
const formulario = document.getElementById('formulario');
const inputNombre = document.getElementById('nombre');
const inputCorreo = document.getElementById('correo');
const selectInteres = document.getElementById('interes');
const mensaje = document.getElementById('mensaje');
const listaSocios = document.getElementById('listaSocios');
//---------------------------------//
//--|constantes_y_estado_inicial|--//
//---------------------------------//
const SOCIOS_BASE = 120;
const CLAVE = 'asociacion_estado';
const estadoInicial = {
    reservas: [],
    socios: [],
    borrador: {
        nombre: '',
        correo: '',
        interes: 'Taller de danza'
    }
};
//---------------------------------//
//--|lectura_del_estado_guardado|--//
//---------------------------------//
function leerEstado() {
    try {
        const guardado = localStorage.getItem(CLAVE);
        return guardado ? { ...estadoInicial, ...JSON.parse(guardado) } : { ...estadoInicial };
    } catch (error) {
        return { ...estadoInicial };
    }
}
let estado = leerEstado();
function guardarEstado() {
    localStorage.setItem(CLAVE, JSON.stringify(estado));
}
//-----------------------------//
//--|mensajes_del_formulario|--//
//-----------------------------//
function mostrarMensaje(texto, esExito = false) {
    mensaje.textContent = texto;
    mensaje.classList.toggle('exito', esExito);
}
//---------------------------------//
//--|reservar_y_cancelar_eventos|--//
//---------------------------------//
function alternarReserva(id) {
    if (estado.reservas.includes(id)) {
        estado.reservas = estado.reservas.filter(r => r !== id);
    } else {
        estado.reservas.push(id);
    }
    guardarEstado();
    dibujarPantalla();
}
//----------------------------------//
//--|inscripcion_de_nuevos_socios|--//
//----------------------------------//
function agregarSocio(evento) {
    evento.preventDefault();
    const nombre = inputNombre.value.trim();
    const correo = inputCorreo.value.trim().toLowerCase();
    if (nombre.length < 3) return mostrarMensaje('Escribe tu nombre completo.');
    if (!/^\S+@\S+\.\S+$/.test(correo)) return mostrarMensaje('Escribe un correo válido.');
    if (estado.socios.some(s => s.correo === correo)) return mostrarMensaje('Ese correo ya está inscrito.');
    estado.socios.push({
        id: Date.now(),
        nombre,
        correo,
        interes: selectInteres.value
    });
    estado.borrador = { ...estadoInicial.borrador };
    guardarEstado();
    formulario.reset();
    mostrarMensaje(`¡Bienvenido, ${nombre}! Ya eres parte de la asociación.`, true);
    dibujarPantalla();
}
//---------------------------//
//--|eliminacion_de_socios|--//
//---------------------------//
function eliminarSocio(id) {
    estado.socios = estado.socios.filter(s => s.id !== id);
    guardarEstado();
    dibujarPantalla();
}
//----------------------------------//
//--|actualizacion_de_la_pantalla|--//
//----------------------------------//
function dibujarPantalla() {
    eventos.forEach(evento => {
        const reservado = estado.reservas.includes(evento.dataset.id);
        const cupos = Number(evento.dataset.cupos) - (reservado ? 1 : 0);
        evento.classList.toggle('reservado', reservado);
        evento.querySelector('.cupos').textContent = cupos;
        evento.querySelector('[data-reservar]').textContent = reservado ? 'Reservado ✓ (cancelar)' : 'Reservar cupo';
    });
    totalSocios.textContent = SOCIOS_BASE + estado.socios.length;
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
//--------------------------//
//--|eventos_y_formulario|--//
//--------------------------//
document.addEventListener('click', evento => {
    const boton = evento.target.closest('[data-reservar]');
    if (boton) alternarReserva(boton.closest('.evento').dataset.id);
});
formulario.addEventListener('submit', agregarSocio);
formulario.addEventListener('input', () => {
    estado.borrador = {
        nombre: inputNombre.value,
        correo: inputCorreo.value,
        interes: selectInteres.value
    };
    guardarEstado();
});
//-------------------------------------//
//--|inicializacion_de_la_aplicacion|--//
//-------------------------------------//
inputNombre.value = estado.borrador.nombre;
inputCorreo.value = estado.borrador.correo;
selectInteres.value = estado.borrador.interes;
dibujarPantalla();