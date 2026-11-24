(async function () {
    const MAX_FOTO_MB = 2;

    // Esperamos a que sesion.js sepa quién eres
    const usuario = await window.sesionLista;
    if (!usuario) return;   // sin sesión la sesion.js ya te mandó al login

    // Manda datos a un PHP y devuelve el JSON; si falla, lanza un Error con el mensaje
    async function enviar(url, cuerpo) {
        const respuesta = await fetch(url, { method: 'POST', body: cuerpo, cache: 'no-store' });

        if (respuesta.status === 401) {
            window.location.href = 'index.html';
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

    // Mensaje verde o rojo al lado del botón
    function mensaje(form, texto, esError) {
        const caja = form.querySelector('.form-msg');
        caja.textContent = texto;
        caja.classList.toggle('error', Boolean(esError));
        caja.classList.toggle('ok', !esError);
        caja.hidden = !texto;
    }

    // Deshabilita el botón mientras se guarda
    async function conBoton(form, tarea) {
        const boton = form.querySelector('button[type="submit"]');
        boton.disabled = true;
        mensaje(form, '', false);
        try {
            await tarea();
        } catch (error) {
            mensaje(form, error.message, true);
        } finally {
            boton.disabled = false;
        }
    }

    /*  tod le perfil */
    const formPerfil = document.getElementById('form-perfil');
    const avatarPrev = document.getElementById('avatar-prev');
    const archivoAvatar = document.getElementById('avatar-archivo');
    const botonCambiar = document.getElementById('btn-cambiar-foto');
    const botonQuitar = document.getElementById('btn-quitar-foto');
    const campoNombre = document.getElementById('username');
    const campoBio = document.getElementById('bio');
    const contadorBio = document.getElementById('bio-contador');

    let quitarFoto = false;      // <---- la persona pidió quitar su foto
    let fotoMostrada = usuario.avatar;   //<---- la que se está viendo ahora

    function mostrarFoto(ruta, nombre) {
        pintarAvatar(avatarPrev, { avatar: ruta, username: nombre });   // pintarAvatar viene de sesion.js
        botonQuitar.hidden = !ruta;
    }

    function llenarPerfil(u) {
        campoNombre.value = u.username;
        campoBio.value = u.bio || '';
        contadorBio.textContent = campoBio.value.length + ' / 200';
        fotoMostrada = u.avatar;
        quitarFoto = false;
        archivoAvatar.value = '';
        mostrarFoto(u.avatar, u.username);
    }
    llenarPerfil(usuario);

    document.getElementById('correo-actual').textContent = usuario.email;

    campoBio.addEventListener('input', () => {
        contadorBio.textContent = campoBio.value.length + ' / 200';
    });

    // Si todavía no tiene foto, la inicial sigue a lo que escribe en "Nombre de usuario"
    campoNombre.addEventListener('input', () => {
        if (!fotoMostrada && !archivoAvatar.files[0]) {
            mostrarFoto(null, campoNombre.value || usuario.username);
        }
    });

    botonCambiar.addEventListener('click', () => archivoAvatar.click());

    archivoAvatar.addEventListener('change', () => {
        const archivo = archivoAvatar.files[0];
        mensaje(formPerfil, '', false);
        if (!archivo) return;

        if (archivo.size > MAX_FOTO_MB * 1024 * 1024) {
            archivoAvatar.value = '';
            mensaje(formPerfil, 'La foto pesa más de ' + MAX_FOTO_MB + ' MB.', true);
            return;
        }
        quitarFoto = false;
        mostrarFoto(URL.createObjectURL(archivo), campoNombre.value);   // vista previa (todavía no se guarda)
    });

    botonQuitar.addEventListener('click', () => {
        quitarFoto = true;
        fotoMostrada = null;
        archivoAvatar.value = '';
        mostrarFoto(null, campoNombre.value || usuario.username);
    });

    formPerfil.addEventListener('submit', (e) => {
        e.preventDefault();
        conBoton(formPerfil, async () => {
            const datos = new FormData();
            datos.append('username', campoNombre.value.trim());
            datos.append('bio', campoBio.value.trim());
            datos.append('quitar_avatar', quitarFoto ? '1' : '0');
            if (archivoAvatar.files[0]) datos.append('avatar', archivoAvatar.files[0]);

            const respuesta = await enviar('carpeta_php/actualizar_perfil.php', datos);

            Object.assign(usuario, respuesta.usuario);
            llenarPerfil(usuario);
            rellenarUsuario(usuario);   // actualiza del nombre y foto en el menú (viene de sesion.js)
            mensaje(formPerfil, respuesta.message, false);
        });
    });

    /* Corrreo */
    const formCorreo = document.getElementById('form-correo');
    const campoCorreo = document.getElementById('correo-nuevo');
    const campoCorreoPass = document.getElementById('correo-password');

    formCorreo.addEventListener('submit', (e) => {
        e.preventDefault();
        conBoton(formCorreo, async () => {
            const respuesta = await enviar('carpeta_php/cambiar_correo.php', new URLSearchParams({
                email: campoCorreo.value.trim(),
                password: campoCorreoPass.value
            }));
            usuario.email = respuesta.email;
            document.getElementById('correo-actual').textContent = respuesta.email;
            campoCorreo.value = '';
            campoCorreoPass.value = '';
            mensaje(formCorreo, respuesta.message, false);
        });
    });

    /*Contraseña */
    const formPassword = document.getElementById('form-password');
    const passActual = document.getElementById('pass-actual');
    const passNueva = document.getElementById('pass-nueva');
    const passRepetir = document.getElementById('pass-repetir');

    formPassword.addEventListener('submit', (e) => {
        e.preventDefault();
        conBoton(formPassword, async () => {
            if (passNueva.value !== passRepetir.value) {
                throw new Error('Las contraseñas nuevas no coinciden.');
            }
            const respuesta = await enviar('carpeta_php/cambiar_password.php', new URLSearchParams({
                actual: passActual.value,
                nueva: passNueva.value,
                repetir: passRepetir.value
            }));
            passActual.value = '';
            passNueva.value = '';
            passRepetir.value = '';
            mensaje(formPassword, respuesta.message, false);
        });
    });
})();