const LOGIN_DESDE_CANAL = 'index.html';
const ICONOS_CANAL = { musica: 'i-music', deportes: 'i-ball', memes: 'i-smile' };
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const MAX_FOTO_MB = 4;
const CADA_CUANTO_REVISAR = 8000;   // cada 8 segundos buscamos publicaciones nuevas

const NS_SVG = 'http://www.w3.org/2000/svg';
const slug = (new URLSearchParams(window.location.search).get('c') || 'musica').toLowerCase();
const menosMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const feed = document.getElementById('feed');
const formulario = document.getElementById('composer');
const campoTexto = document.getElementById('texto');
const campoFoto = document.getElementById('foto');
const botonFoto = document.getElementById('btn-foto');
const vistaPrevia = document.getElementById('preview');
const imagenPrevia = document.getElementById('preview-img');
const botonQuitar = document.getElementById('quitar-foto');
const botonEnviar = document.getElementById('enviar');
const cajaError = document.getElementById('error');


// el id de la publicación más nueva que ya tenemos
let ultimoId = 0;

// Crea un elemento con clase y texto 
function el(etiqueta, clase, texto) {
    const nodo = document.createElement(etiqueta);
    if (clase) nodo.className = clase;
    if (texto !== undefined) nodo.textContent = texto;
    return nodo;
}

//sprite icono 
function icono(id) {
    const svg = document.createElementNS(NS_SVG, 'svg');
    svg.setAttribute('class', 'icono');
    const uso = document.createElementNS(NS_SVG, 'use');
    uso.setAttribute('href', '#' + id);
    svg.appendChild(uso);
    return svg;
}

function inicialDe(nombre) {
    return (nombre || '?').charAt(0).toUpperCase();
}

// Círculo con la foto de perfil de la persona o su inicial si es q no tiene foto
function crearAvatar(nombre, ruta) {
    const circulo = el('span', 'avatar');
    if (ruta) {
        const foto = document.createElement('img');
        foto.src = ruta;
        foto.alt = '';
        foto.loading = 'lazy';
        circulo.appendChild(foto);
    } else {
        circulo.textContent = inicialDe(nombre);
    }
    return circulo;
}

// timepo de respuestAa
function hace(ts) {
    const seg = Math.max(0, Math.floor(Date.now() / 1000 - ts));
    if (seg < 60) return 'ahora mismo';
    const min = Math.floor(seg / 60);
    if (min < 60) return 'hace ' + min + ' min';
    const horas = Math.floor(min / 60);
    if (horas < 24) return 'hace ' + horas + ' h';
    const dias = Math.floor(horas / 24);
    return dias === 1 ? 'ayer' : 'hace ' + dias + ' días';
}

// Llama a un PHP y devuelve el JS. Si no hay sesión, manda al login.
async function api(url, opciones) {
    const respuesta = await fetch(url, Object.assign({ cache: 'no-store' }, opciones));

    if (respuesta.status === 401) {
        window.location.href = LOGIN_DESDE_CANAL;
        throw new Error('Sin sesión');
    }

    let datos;
    try {
        datos = await respuesta.json();
    } catch (error) {
        throw new Error('El servidor no contestó bien.');
    }
    if (!respuesta.ok || !datos.success) {
        throw new Error(datos.message || 'Algo salió mal.');
    }
    return datos;
}

function enviarDatos(url, datos) {
    return api(url, { method: 'POST', body: new URLSearchParams(datos) });
}

// Entrada suave de un elemento
function entrar(nodo, retraso) {
    if (menosMovimiento) return;
    nodo.animate(
        [
            { opacity: 0, transform: 'translateY(12px)' },
            { opacity: 1, transform: 'translateY(0)' }
        ],
        { duration: 350, easing: EASE, delay: retraso || 0, fill: 'backwards' }
    );
}

//Animacion del boton
function popNumero(numero) {
    if (menosMovimiento) return;
    numero.animate(
        [
            { opacity: 0, transform: 'translateY(8px)', filter: 'blur(2px)' },
            { opacity: 1, transform: 'translateY(0)', filter: 'blur(0)' }
        ],
        { duration: 250, easing: EASE }
    );
}

function mostrarError(texto) {
    cajaError.textContent = texto;
    cajaError.hidden = !texto;
}

/* ncabezado del canal*/
function pintarCanal(canal) {
    document.title = 'Becool | ' + canal.nombre;
    document.getElementById('canal-nombre').textContent = canal.nombre;
    document.getElementById('canal-desc').textContent = canal.descripcion;
    document.getElementById('canal-icono').setAttribute('href', '#' + (ICONOS_CANAL[slug] || 'i-music'));

    // Marca este canal en la lista de chats de la barra lateral
    const enlace = document.querySelector('.chat[href="canal.html?c=' + slug + '"]');
    if (enlace) enlace.setAttribute('aria-current', 'page');
}

/* unna publicacionn*/
function crearPublicacion(p) {
    const articulo = el('article', 'post');
    articulo.dataset.id = p.id;
    articulo.appendChild(crearAvatar(p.autor, p.autor_avatar));

    const cuerpo = el('div', 'post-cuerpo');

    const cabecera = el('div', 'post-cab');
    const cuando = el('span', '', hace(p.ts));
    cuando.dataset.ts = p.ts;   // para refrescar el "hace X min"
    cabecera.append(el('strong', '', p.autor), cuando);
    cuerpo.appendChild(cabecera);

    if (p.contenido) {
        cuerpo.appendChild(el('p', '', p.contenido));
    }

    if (p.imagen) {
        const figura = el('figure', 'post-foto');
        const foto = document.createElement('img');
        foto.src = p.imagen;
        foto.alt = 'Foto publicada por ' + p.autor;
        foto.loading = 'lazy';
        figura.appendChild(foto);
        cuerpo.appendChild(figura);
    }

    // Botones me gusta y comentarios
    const acciones = el('div', 'post-acciones');

    const botonLike = el('button', 'accion');
    botonLike.type = 'button';
    botonLike.setAttribute('aria-pressed', String(p.yo_like));
    botonLike.setAttribute('aria-label', 'Me gusta');
    const numLikes = el('span', 'num', String(p.likes));
    botonLike.append(icono('i-heart'), numLikes);

    const botonComentarios = el('button', 'accion');
    botonComentarios.type = 'button';
    botonComentarios.setAttribute('aria-label', 'Comentarios');
    botonComentarios.setAttribute('aria-expanded', 'false');
    const numComentarios = el('span', 'num', String(p.comentarios));
    botonComentarios.append(icono('i-comment'), numComentarios);

    acciones.append(botonLike, botonComentarios);
    cuerpo.appendChild(acciones);

    // Sección de comentarios
    const seccion = crearSeccionComentarios(p.id, numComentarios);
    cuerpo.appendChild(seccion.nodo);

    botonLike.addEventListener('click', () => alternarLike(p.id, botonLike, numLikes));
    botonComentarios.addEventListener('click', () => {
        const abrir = seccion.nodo.hidden;
        seccion.nodo.hidden = !abrir;
        botonComentarios.setAttribute('aria-expanded', String(abrir));
        if (abrir) seccion.abrir();
    });

    articulo.appendChild(cuerpo);
    return articulo;
}

/* los likes -*/
async function alternarLike(idPublicacion, boton, numero) {
    const antes = boton.getAttribute('aria-pressed') === 'true';
    const cuentaAntes = Number(numero.textContent);

    // Respondemos al instante y luego confirmamos con el servidor
    boton.setAttribute('aria-pressed', String(!antes));
    numero.textContent = cuentaAntes + (antes ? -1 : 1);
    popNumero(numero);

    try {
        const datos = await enviarDatos('carpeta_php/like.php', { publicacion: idPublicacion });
        boton.setAttribute('aria-pressed', String(datos.liked));
        numero.textContent = datos.likes;
    } catch (error) {
        // Si falló, regresamos todo como estaba
        boton.setAttribute('aria-pressed', String(antes));
        numero.textContent = cuentaAntes;
    }
}

/*Comentarios*/
function crearComentario(c) {
    const fila = el('div', 'comentario');
    fila.appendChild(crearAvatar(c.autor, c.autor_avatar));

    const cuerpo = el('div', 'comentario-cuerpo');
    const cab = el('div', 'comentario-cab');
    const cuando = el('span', '', hace(c.ts));
    cuando.dataset.ts = c.ts;
    cab.append(el('strong', '', c.autor), cuando);
    cuerpo.append(cab, el('p', 'comentario-texto', c.texto));

    fila.appendChild(cuerpo);
    return fila;
}

function crearSeccionComentarios(idPublicacion, numero) {
    const nodo = el('section', 'comentarios');
    nodo.hidden = true;

    const lista = el('div', 'comentarios-lista');

    const form = el('form', 'comentario-form');
    const campo = document.createElement('input');
    campo.type = 'text';
    campo.maxLength = 500;
    campo.placeholder = 'Escribe un comentario';
    campo.setAttribute('aria-label', 'Escribe un comentario');
    campo.autocomplete = 'off';
    const enviar = el('button', '', 'Enviar');
    enviar.type = 'submit';
    form.append(campo, enviar);

    nodo.append(lista, form);

    let cargado = false;

    async function cargar() {
        try {
            const datos = await api('carpeta_php/comentarios.php?publicacion=' + idPublicacion);
            lista.replaceChildren();
            if (datos.comentarios.length === 0) {
                lista.appendChild(el('p', 'comentario-vacio', 'Todavía no hay comentarios.'));
            }
            datos.comentarios.forEach((c) => lista.appendChild(crearComentario(c)));
            cargado = true;
        } catch (error) {
            lista.replaceChildren(el('p', 'comentario-vacio', error.message));
        }
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const texto = campo.value.trim();
        if (texto === '') return;

        enviar.disabled = true;
        try {
            const datos = await enviarDatos('carpeta_php/comentarios.php', { publicacion: idPublicacion, texto: texto });
            const vacio = lista.querySelector('.comentario-vacio');
            if (vacio) vacio.remove();
            const fila = crearComentario(datos.comentario);
            lista.appendChild(fila);
            entrar(fila);
            numero.textContent = datos.total;
            popNumero(numero);
            campo.value = '';
        } catch (error) {
            campo.setCustomValidity(error.message);
            campo.reportValidity();
            campo.setCustomValidity('');
        } finally {
            enviar.disabled = false;
            campo.focus();
        }
    });

    return {
        nodo: nodo,
        abrir: async () => {
            if (!cargado) await cargar();
            campo.focus();
        }
    };
}

/* Mostrar publicaciones en la página */
function quitarVacio() {
    const vacio = feed.querySelector('.vacio-feed');
    if (vacio) vacio.remove();
}

function pintarVacioSiHaceFalta() {
    if (!feed.querySelector('.post') && !feed.querySelector('.vacio-feed')) {
        feed.appendChild(el('p', 'vacio-feed', 'Todavía no hay publicaciones. ¡Sé la primera persona en publicar!'));
    }
}

function agregarAlPrincipio(p, retraso) {
    if (feed.querySelector('[data-id="' + p.id + '"]')) return;   // ya la teníamos
    quitarVacio();
    const articulo = crearPublicacion(p);
    feed.prepend(articulo);
    entrar(articulo, retraso);
    if (p.id > ultimoId) ultimoId = p.id;
}

/*Carga inicial*/
async function cargarCanal() {
    try {
        const datos = await api('carpeta_php/publicaciones.php?comunidad=' + encodeURIComponent(slug));
        pintarCanal(datos.canal);

        // Vienen de la más nueva a la más vieja
        datos.publicaciones.forEach((p, i) => {
            const articulo = crearPublicacion(p);
            feed.appendChild(articulo);
            entrar(articulo, Math.min(i, 8) * 50);
            if (p.id > ultimoId) ultimoId = p.id;
        });
        pintarVacioSiHaceFalta();
    } catch (error) {
        document.getElementById('canal-nombre').textContent = 'No se pudo abrir el canal';
        feed.replaceChildren(el('p', 'vacio-feed', error.message));
    }
}

/*Publicaciones nuevas de otras personas */
async function buscarNuevas() {
    if (document.hidden || ultimoId === 0 && !feed.querySelector('.vacio-feed')) return;
    try {
        const datos = await api('carpeta_php/publicaciones.php?comunidad=' + encodeURIComponent(slug) + '&despues=' + ultimoId);
        // Vienen de la más nueva a la más vieja: las ponemos de la más vieja a la más nueva
        datos.publicaciones.slice().reverse().forEach((p) => agregarAlPrincipio(p));
    } catch (error) {
        /* si falla una revisión, ya intentará la siguiente */
    }
}

// Mantiene al día los "hace 5 min"
function refrescarHoras() {
    document.querySelectorAll('[data-ts]').forEach((nodo) => {
        nodo.textContent = hace(Number(nodo.dataset.ts));
    });
}

/* Formulario para publicar - */
function quitarFoto() {
    campoFoto.value = '';
    if (imagenPrevia.src.startsWith('blob:')) URL.revokeObjectURL(imagenPrevia.src);
    imagenPrevia.removeAttribute('src');
    vistaPrevia.hidden = true;
}

botonFoto.addEventListener('click', () => campoFoto.click());
botonQuitar.addEventListener('click', quitarFoto);

campoFoto.addEventListener('change', () => {
    const archivo = campoFoto.files[0];
    mostrarError('');
    if (!archivo) return;

    if (archivo.size > MAX_FOTO_MB * 1024 * 1024) {
        quitarFoto();
        mostrarError('La foto pesa más de ' + MAX_FOTO_MB + ' MB.');
        return;
    }
    imagenPrevia.src = URL.createObjectURL(archivo);
    vistaPrevia.hidden = false;
});

// Ctrl + Enter publica sin usar el mouse funcion extra
campoTexto.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        formulario.requestSubmit();
    }
});

formulario.addEventListener('submit', async (e) => {
    e.preventDefault();
    mostrarError('');

    const texto = campoTexto.value.trim();
    const foto = campoFoto.files[0];
    if (texto === '' && !foto) {
        mostrarError('Escribe algo o sube una foto.');
        return;
    }

    const datos = new FormData();
    datos.append('comunidad', slug);
    datos.append('contenido', texto);
    if (foto) datos.append('imagen', foto);

    botonEnviar.disabled = true;
    try {
        const respuesta = await api('carpeta_php/publicaciones.php', { method: 'POST', body: datos });
        agregarAlPrincipio(respuesta.publicacion);
        campoTexto.value = '';
        quitarFoto();
    } catch (error) {
        mostrarError(error.message);
    } finally {
        botonEnviar.disabled = false;
    }
});

/* arranque */
cargarCanal();
setInterval(buscarNuevas, CADA_CUANTO_REVISAR);
setInterval(refrescarHoras, 60000);