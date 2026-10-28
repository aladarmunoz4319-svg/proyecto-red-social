const formLogin = document.querySelector('#sesion form');
const inputUsuario = document.getElementById('username');
const inputPassword = document.getElementById('password');
const botonLogin = formLogin.querySelector('button[type="submit"]');
 
// Mostrar mensaje de error // 
let mensaje = document.getElementById('mensaje-login');
if (!mensaje) {
    mensaje = document.createElement('p');
    mensaje.id = 'mensaje-login';
    mensaje.setAttribute('role', 'alert');
    formLogin.appendChild(mensaje);
}
 
function mostrarMensaje(texto, esError = true) {
    mensaje.textContent = texto;
    mensaje.style.color = esError ? 'crimson' : 'green';
}
 
function validar(usuario, password) {
    if (usuario.length < 3) {
        return 'El usuario debe tener al menos 3 caracteres.';
    }
    if (password.length < 6) {
        return 'La contraseña debe tener al menos 6 caracteres.';
    }
    return null; // todo correcto
}
 
formLogin.addEventListener('submit', async (evento) => {
    evento.preventDefault(); // evita que la página se recargue
    mostrarMensaje('');
 
    const usuario = inputUsuario.value.trim();
    const password = inputPassword.value;
 
    // 1. Validación en el navegador
    const error = validar(usuario, password);
    if (error) {
        mostrarMensaje(error);
        return;
    }
 
    // Espera de boton //
    botonLogin.disabled = true;
    botonLogin.textContent = 'Ingresando...';
 
    try {
        // 3. Enviar los datos a login.php
        const respuesta = await fetch('login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                username: usuario,
                password: password
            })
        });
 
        if (!respuesta.ok) {
            throw new Error('Error del servidor (' + respuesta.status + ')');
        }
 
        // 4. Se espera que login.php responda con JSON:
        //    { "success": true, "redirect": "inicio.html" }
        //    { "success": false, "message": "Usuario o contraseña incorrectos" }
        const datos = await respuesta.json();
 
        if (datos.success) {
            mostrarMensaje('¡Bienvenido!', false);
            window.location.href = datos.redirect || 'inicio.html';
        } else {
            mostrarMensaje(datos.message || 'Usuario o contraseña incorrectos.');
            inputPassword.value = '';
            inputPassword.focus();
        }
    } catch (err) {
        mostrarMensaje('No se pudo iniciar sesión. Intenta de nuevo más tarde.');
        console.error(err);
    } finally {
        // 5. Reactivar el botón
        botonLogin.disabled = false;
        botonLogin.textContent = 'Iniciar Sesión';
    }
});
 