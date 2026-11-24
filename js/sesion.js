const PAGINA_LOGIN = 'index.html';

async function cargarSesion() {
    try {
        // no-store que el navegador no use una respuesta vieja guardada
        const respuesta = await fetch('carpeta_php/usuario.php', { cache: 'no-store' });

        if (respuesta.status === 401) {
            window.location.href = PAGINA_LOGIN;
            return null;
        }
        if (!respuesta.ok) {
            throw new Error('Error del servidor (' + respuesta.status + ')');
        }

        const datos = await respuesta.json();
        if (!datos.success) {
            window.location.href = PAGINA_LOGIN;
            return null;
        }
        rellenarUsuario(datos.usuario);
        return datos.usuario;
    } catch (error) {
        console.error('No se pudo cargar la sesión:', error);
        return null;
    }
}

// Pone la foto de perfil dentro de un círculo .avatar o la inicial si no hay foto
function pintarAvatar(nodo, usuario) {
    nodo.replaceChildren();
    if (usuario.avatar) {
        const foto = document.createElement('img');
        foto.src = usuario.avatar;
        foto.alt = '';
        nodo.appendChild(foto);
    } else {
        nodo.textContent = (usuario.username || '?').charAt(0).toUpperCase();
    }
}

function rellenarUsuario(u) {
    // dice el tiermpo actual
    const fecha = new Date(String(u.creado_en).replace(' ', 'T'));
    const desde = isNaN(fecha)
        ? ''
        : fecha.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });

    const valores = {
        nombre: u.username,
        correo: u.email,
        rol: u.rol,
        desde: desde,
        bio: (u.bio || '').trim()
    };

    document.querySelectorAll('[data-usuario]').forEach((el) => {
        const clave = el.dataset.usuario;

        if (clave === 'inicial') {
            pintarAvatar(el, u);
            return;
        }

        let valor = valores[clave] ?? '';
        if (clave === 'bio') {
            el.classList.toggle('vacio', valor === '');
            if (valor === '') valor = 'Todavía no escribes tu biografía.';
        }
      
        el.textContent = valor;
    });
}

window.sesionLista = cargarSesion();
