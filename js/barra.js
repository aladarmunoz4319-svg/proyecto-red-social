// Marca en la barra izquierda la sección donde estás (también la usa navegacion.js)
function marcarActivo(url) {
    const destino = new URL(url || location.href, location.href);
    const archivo = destino.pathname.split('/').pop() || 'indextwo.html';
    let canal = destino.searchParams.get('c');
    if (archivo === 'canal.html' && !canal) canal = 'musica';

    document.querySelectorAll('.sidebar [aria-current]').forEach((nodo) => {
        nodo.removeAttribute('aria-current');
    });

    document.querySelectorAll('.sidebar a[href]').forEach((enlace) => {
        if (enlace.classList.contains('logo')) return;
        const ruta = new URL(enlace.getAttribute('href'), location.href);
        const mismoArchivo = ruta.pathname.split('/').pop() === archivo;
        const mismoCanal = archivo !== 'canal.html' || ruta.searchParams.get('c') === canal;
        if (mismoArchivo && mismoCanal) enlace.setAttribute('aria-current', 'page');
    });
}

window.barraLista = fetch('barra.html', { cache: 'no-store' })
    .then((respuesta) => {
        if (!respuesta.ok) throw new Error('No se encontró barra.html');
        return respuesta.text();
    })
    .then((html) => {
        document.body.insertAdjacentHTML('afterbegin', html);
        marcarActivo();

        // El nombre y la foto se llenan cuando sesion.js ya sabe quién eres
        if (window.sesionLista) {
            window.sesionLista.then((usuario) => {
                if (usuario) rellenarUsuario(usuario);
            });
        }
    })
    .catch((error) => console.error('No se pudo cargar la barra:', error));