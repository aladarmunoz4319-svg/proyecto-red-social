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

/* Entrada de la página una sola vez, al cargar*/
function animarEntrada() {
    // Barra lateral cada fila entra desde la izquierda, una tras otra (
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
        if (window.ScrollTrigger) ScrollTrigger.refresh();
    }

    botones.forEach((b) => b.addEventListener('click', () => seleccionar(b)));

    // Posición inicial sin animación y de nuevo cuando la fuente termina de cargar
    const activo = () => tabs.querySelector('[aria-pressed="true"]');
    moverPastilla(activo(), false);
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => moverPastilla(activo(), false));
    }
    window.addEventListener('resize', () => moverPastilla(activo(), false));
}

/* los likes*/
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

/* atajo */
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
