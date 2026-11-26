const PAGINA_INICIO = 'inicio.html';

function crearMensaje(form) {
    let mensaje = form.querySelector('.mensaje-form');
    if (!mensaje) {
        mensaje = document.createElement('p');
        mensaje.className = 'mensaje-form';
        mensaje.setAttribute('role', 'alert');
        form.appendChild(mensaje);
    }
    return mensaje;
}

function mostrarMensaje(mensaje, texto, esError = true) {
    mensaje.textContent = texto;
    mensaje.style.color = esError ? 'crimson' : 'lightgreen';
}

async function enviarFormulario(url, datos) {
    const respuesta = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(datos)
    });

    if (!respuesta.ok) {
        throw new Error('Error del servidor (' + respuesta.status + ')');
    }
    return respuesta.json();
}

//  LOGIN 
const formLogin = document.getElementById('form-login');

if (formLogin) {
    const inputUsuario = document.getElementById('email');
    const inputPassword = document.getElementById('password');
    const botonLogin = formLogin.querySelector('button[type="submit"]');
    const textoBoton = botonLogin.textContent;
    const mensajeLogin = crearMensaje(formLogin);

    function validarLogin(usuario, password) {
        if (usuario.length < 3) {
            return 'El usuario debe tener al menos 3 caracteres.';
        }
        if (password.length < 6) {
            return 'La contraseña debe tener al menos 6 caracteres.';
        }
        return null;
    }

    formLogin.addEventListener('submit', async (evento) => {
        evento.preventDefault();
        mostrarMensaje(mensajeLogin, '');

        const usuario = inputUsuario.value.trim();
        const password = inputPassword.value;

        const error = validarLogin(usuario, password);
        if (error) {
            mostrarMensaje(mensajeLogin, error);
            return;
        }

        botonLogin.disabled = true;
        botonLogin.textContent = 'Preparando tu experiencia...';

        try {
          const datos = await enviarFormulario('carpeta_php/login.php', {
    email: usuario,
    password: password
});

            if (datos.success) {
                mostrarMensaje(mensajeLogin, '¡Bienvenido!', false);
                window.location.href = datos.redirect || PAGINA_INICIO;
            } else if (datos.noExiste) {
                // si laa cuenta no existe lo mandamos a registrarse
                mostrarMensaje(mensajeLogin, 'No existe esa cuenta. Te llevamos al registro...');
                setTimeout(() => {
                    window.location.href = 'registro.html';
                }, 1500);
            } else {
                mostrarMensaje(mensajeLogin, datos.message || 'Usuario o contraseña incorrectos.');
                inputPassword.value = '';
                inputPassword.focus();
            }
        } catch (err) {
            mostrarMensaje(mensajeLogin, 'Inicio de sesión fallido. Intenta de nuevo más tarde.');
            console.error(err);
        } finally {
            botonLogin.disabled = false;
            botonLogin.textContent = textoBoton;
        }
    });
}

//   ESTO ES   MI    REGISTRO 
const formRegistro = document.getElementById('form-registro');

if (formRegistro) {
    const botonRegistro = formRegistro.querySelector('button[type="submit"]');
    const textoBotonReg = botonRegistro.textContent;
    const mensajeRegistro = crearMensaje(formRegistro);

    formRegistro.addEventListener('submit', async (evento) => {
        evento.preventDefault();
        mostrarMensaje(mensajeRegistro, '');

        const username = document.getElementById('reg-usuario').value.trim();
        const email = document.getElementById('reg-correo').value.trim();
        const password = document.getElementById('reg-password').value;
        const password2 = document.getElementById('reg-password2').value;

        if (username.length < 3 || username.length > 30) {
            mostrarMensaje(mensajeRegistro, 'El usuario debe tener entre 3 y 30 caracteres.');
            return;
        }
        if (password.length < 6) {
            mostrarMensaje(mensajeRegistro, 'La contraseña debe tener al menos 6 caracteres.');
            return;
        }
        if (password !== password2) {
            mostrarMensaje(mensajeRegistro, 'Las contraseñas no coinciden.');
            return;
        }

        botonRegistro.disabled = true;
        botonRegistro.textContent = 'Preparando la mejor experiencia...';

        try {
            const datos = await enviarFormulario('carpeta_php/registro.php', { username, email, password });

            if (datos.success) {
                mostrarMensaje(mensajeRegistro, 'Cuenta creada. Ya puedes iniciar sesión.', false);
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            } else {
                mostrarMensaje(mensajeRegistro, datos.message || 'No se pudo crear la cuenta.');
            }
        } catch (err) {
            mostrarMensaje(mensajeRegistro, 'No se pudo registrar. Intenta de nuevo más tarde.');
            console.error(err);
        } finally {
            botonRegistro.disabled = false;
            botonRegistro.textContent = textoBotonReg;
        }
    });
}

// AQUI MUESTRA LAS COMUNIDADES 
const botones = document.querySelectorAll('button[data-target]');
const comunidades = document.querySelectorAll('.comunidad');

botones.forEach(boton => {
    boton.addEventListener('click', () => {
        comunidades.forEach(c => c.hidden = true);
        document.getElementById(boton.dataset.target).hidden = false;
    });
});
// TOD ESTO ES PARA LA DINAMICA DE QUE AL USUARIO "OLVIDÉ MI CONTRASEÑA"
const formOlvide = document.getElementById('form-olvide');

if (formOlvide) {
    const botonOlvide = formOlvide.querySelector('button[type="submit"]');
    const textoBotonOlvide = botonOlvide.textContent;
    const mensajeOlvide = crearMensaje(formOlvide);

    formOlvide.addEventListener('submit', async (evento) => {
        evento.preventDefault();
        mostrarMensaje(mensajeOlvide, '');

        const email = document.getElementById('olvide-correo').value.trim();

        botonOlvide.disabled = true;
        botonOlvide.textContent = 'Enviando...';

        try {
            const datos = await enviarFormulario('carpeta_php/olvide.php', { email });

            if (datos.success) {
                mostrarMensaje(mensajeOlvide, datos.message, false);
            } else {
                mostrarMensaje(mensajeOlvide, datos.message || 'No se pudo procesar la solicitud.');
            }
        } catch (err) {
            mostrarMensaje(mensajeOlvide, 'Algo salió mal. Intenta de nuevo más tarde.');
            console.error(err);
        } finally {
            botonOlvide.disabled = false;
            botonOlvide.textContent = textoBotonOlvide;
        }
    });x
}

//  ESTO DE AQUI RESTABLECERA CONTRASEÑA CUANDO EL PISHI USUARIO DIGA ALV
const formRestablecer = document.getElementById('form-restablecer');

if (formRestablecer) {
    const token = new URLSearchParams(window.location.search).get('token');
    const botonRest = formRestablecer.querySelector('button[type="submit"]');
    const textoBotonRest = botonRest.textContent;
    const mensajeRest = crearMensaje(formRestablecer);

    if (!token) {
        mostrarMensaje(mensajeRest, 'Enlace no válido. Pide uno nuevo.');
        botonRest.disabled = true;
    }

    formRestablecer.addEventListener('submit', async (evento) => {
        evento.preventDefault();
        mostrarMensaje(mensajeRest, '');

        const password = document.getElementById('nueva-password').value;
        const password2 = document.getElementById('nueva-password2').value;

        if (password.length < 6) {
            mostrarMensaje(mensajeRest, 'La contraseña debe tener al menos 6 caracteres.');
            return;
        }
        if (password !== password2) {
            mostrarMensaje(mensajeRest, 'Las contraseñas no coinciden.');
            return;
        }

        botonRest.disabled = true;
        botonRest.textContent = 'Guardando...';

        try {
            const datos = await enviarFormulario('carpeta_php/restablecer.php', { token, password });

            if (datos.success) {
                mostrarMensaje(mensajeRest, 'Contraseña actualizada. Te llevamos al inicio de sesión...', false);
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            } else {
                mostrarMensaje(mensajeRest, datos.message || 'No se pudo cambiar la contraseña.');
                botonRest.disabled = false;
                botonRest.textContent = textoBotonRest;
            }
        } catch (err) {
            mostrarMensaje(mensajeRest, 'Algo salió mal. Intenta de nuevo más tarde.');
            console.error(err);
            botonRest.disabled = false;
            botonRest.textContent = textoBotonRest;
        }
    });
}
// Esta funcion abre el menu lateral de la pagina en cualquier tipo de pantalla retratil z flip
const menuLateral = document.getElementById('menu-lateral');

if (menuLateral) {
    const btnMenu = document.getElementById('btn-menu');
    const fondoMenu = document.getElementById('fondo-menu');
    const btnCerrarMenu = document.getElementById('cerrar-menu');

    const abrirMenu = () => {
        menuLateral.classList.add('abierto');
        fondoMenu.classList.add('visible');
        btnMenu.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    };

    const cerrarMenu = () => {
        menuLateral.classList.remove('abierto');
        fondoMenu.classList.remove('visible');
        btnMenu.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    };

    btnMenu.addEventListener('click', abrirMenu);
    btnCerrarMenu.addEventListener('click', cerrarMenu);
    fondoMenu.addEventListener('click', cerrarMenu);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') cerrarMenu();
    });
}

/* Esta línea corre apenas carga el archivo (el <script> está en el <head>).
   Le avisa al CSS que puede esconder lo que se va a animar, así no hay
   parpadeo. Si algo falla más abajo, se quita y todo se ve normal. */
document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
    const html = document.documentElement;
    const menosMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hayGsap = Boolean(window.gsap && window.ScrollTrigger);

    if (!hayGsap || menosMovimiento) {
        html.classList.remove('js');
    } else {
        gsap.registerPlugin(ScrollTrigger);
        animarEntrada();
        animarAlBajar();
    }

    iniciarFiltro();
    iniciarLikes();
    atajoBuscador();
});

/* Entrada de la página (una sola vez, al cargar)*/
function animarEntrada() {
    // Barra lateral cada fila entra desde la izquierda, una tras otra
    gsap.fromTo('.reveal-x',
        { opacity: 0, x: -14 },
        { opacity: 1, x: 0, duration: 0.5, ease: 'power4.out', stagger: 0.04 }
    );

    // Título y subtítulo suben con un poquito de desenfoque
    gsap.fromTo('.reveal-text',
        { opacity: 0, y: 12, filter: 'blur(3px)' },
        {
            opacity: 1, y: 0, filter: 'blur(0px)',
            duration: 0.6, ease: 'power4.out', stagger: 0.1, delay: 0.15,
            clearProps: 'filter'
        }
    );
}

/* Animaciones al bajar (Scroll)  */
function animarAlBajar() {
    // Cada publicación aparece cuando entra en pantalla.
    // "batch" agrupa las que entran juntas y las anima escalonadas.
    ScrollTrigger.batch('.reveal', {
        start: 'top 90%',
        once: true,   // se anima una sola vez
        onEnter: (grupo) => gsap.fromTo(grupo,
            { opacity: 0, y: 24 },
            { opacity: 1, y: 0, duration: 0.7, ease: 'power4.out', stagger: 0.09, overwrite: true }
        )
    });

    // La barra de arriba gana fondo y una línea fina cuando empiezas a bajar
    ScrollTrigger.create({
        start: 8,
        end: 'max',
        toggleClass: { targets: '.topbar', className: 'scrolled' }
    });
}

/* Filtro con pastilla deslizante  */
function iniciarFiltro() {
    const tabs = document.querySelector('.tabs');
    if (!tabs) return;

    const pastilla = tabs.querySelector('.tabs-pill');
    const botones = Array.from(tabs.querySelectorAll('.tab'));
    const posts = Array.from(document.querySelectorAll('.post'));

    function moverPastilla(boton, animar) {
        if (!animar) pastilla.style.transition = 'none';
        pastilla.style.width = boton.offsetWidth + 'px';
        pastilla.style.transform = 'translateX(' + boton.offsetLeft + 'px)';
        if (!animar) {
            void pastilla.offsetWidth;   // fuerza el recálculo antes de volver a activar la transición
            pastilla.style.transition = '';
        }
    }

    function seleccionar(boton) {
        botones.forEach((b) => b.setAttribute('aria-pressed', String(b === boton)));
        moverPastilla(boton, true);

        const filtro = boton.dataset.filtro;
        posts.forEach((post) => {
            post.hidden = filtro !== 'todo' && post.dataset.comunidad !== filtro;
        });

        // Los posts cambiaron de lugar el ScrollTrigger recalcula posiciones
        if (window.ScrollTrigger) ScrollTrigger.refresh();
    }

    botones.forEach((b) => b.addEventListener('click', () => seleccionar(b)));

    // Posición inicial sin animación (y de nuevo cuando la fuente termina de cargar)
    const activo = () => tabs.querySelector('[aria-pressed="true"]');
    moverPastilla(activo(), false);
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => moverPastilla(activo(), false));
    }
    window.addEventListener('resize', () => moverPastilla(activo(), false));
}

/*  dinamica de los likes */
function iniciarLikes() {
    const menosMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    document.querySelectorAll('[data-like]').forEach((boton) => {
        const numero = boton.querySelector('.num');

        boton.addEventListener('click', () => {
            const activo = boton.getAttribute('aria-pressed') !== 'true';
            boton.setAttribute('aria-pressed', String(activo));
            numero.textContent = Number(numero.textContent) + (activo ? 1 : -1);

            if (!menosMovimiento) {
                numero.animate(
                    [
                        { opacity: 0, transform: 'translateY(8px)', filter: 'blur(2px)' },
                        { opacity: 1, transform: 'translateY(0)', filter: 'blur(0)' }
                    ],
                    { duration: 250, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
                );
            }
        });
    });
}

/* Atajo de la tecla "/" enfoca el buscador */
function atajoBuscador() {
    const buscador = document.querySelector('.buscador input');
    if (!buscador) return;

    document.addEventListener('keydown', (e) => {
        const escribiendo = /^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName);
        if (e.key === '/' && !escribiendo) {
            e.preventDefault();
            buscador.focus();
        }
    });
}