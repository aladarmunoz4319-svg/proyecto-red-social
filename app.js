const formLogin = document.querySelector('#sesion form');
const inputUsuario = document.getElementById('username');
const inputPassword = document.getElementById('password');
const botonLogin = formLogin.querySelector('button[type="submit"]');
 
// Muestra el mensaje de error // 
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
        return ' Usuario debe tener al menos 3 caracteres.';
    }
    if (password.length < 6) {
        return 'La contraseña debe tener al menos 6 caracteres.';
    }
    return null; 
}
 
formLogin.addEventListener('submit', async (evento) => {
    evento.preventDefault(); // evita que la página se recargue //
    mostrarMensaje('');
 
    const usuario = inputUsuario.value.trim();
    const password = inputPassword.value;
 
    //  Validación en el navegador //
    const error = validar(usuario, password);
    if (error) {
        mostrarMensaje(error);
        return;
    }
 
    // Espera de boton //
    botonLogin.disabled = true;
    botonLogin.textContent = 'Ingresando...';
 
    try {
        // Datos a login.php //
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
 
        // login.php es el q interactua con JSON //
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
        mostrarMensaje('Inicio de Sesion Fallido. Intenta de nuevo más tarde.');
        console.error(err);
    } finally {
        // Reactivar boton //
        botonLogin.disabled = false;
        botonLogin.textContent = 'Iniciar Sesión';
    }
});
 