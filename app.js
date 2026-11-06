const PAGINA_INICIO = 'inicio.html';

// Utilidades 
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

//           LOGIN 
const formLogin = document.getElementById('form-login');

if (formLogin) {
    const inputUsuario = document.getElementById('username');
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
        botonLogin.textContent = 'Ingresando...';

        try {
          const datos = await enviarFormulario('carpeta_php/login.php', {
    username: usuario,
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

//       REGISTRO 
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
        botonRegistro.textContent = 'Creando cuenta...';

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

//           Comunidades 
const botones = document.querySelectorAll('button[data-target]');
const comunidades = document.querySelectorAll('.comunidad');

botones.forEach(boton => {
    boton.addEventListener('click', () => {
        comunidades.forEach(c => c.hidden = true);
        document.getElementById(boton.dataset.target).hidden = false;
    });
});