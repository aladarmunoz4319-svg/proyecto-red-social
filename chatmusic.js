document.addEventListener('DOMContentLoaded', () => {
    const feed = document.getElementById('feed');
    const chatForm = document.getElementById('chat-form');
    const textoInput = document.getElementById('input-texto');
    const fotoInput = document.getElementById('input-foto');
    const previewBox = document.getElementById('preview-box');
    const previewImg = document.getElementById('preview-img');
    const btnRemoveImg = document.getElementById('btn-remove-img');

    // Manejo de likes (delegación de eventos para publicaciones nuevas y existentes)
    feed.addEventListener('click', (e) => {
        const botonLike = e.target.closest('.btn-like');
        if (!botonLike) return;

        const contador = botonLike.querySelector('.count');
        let num = parseInt(contador.textContent, 10);

        if (botonLike.classList.contains('liked')) {
            botonLike.classList.remove('liked');
            botonLike.innerHTML = `🤍 <span class="count">${num - 1}</span>`;
        } else {
            botonLike.classList.add('liked');
            botonLike.innerHTML = `❤️ <span class="count">${num + 1}</span>`;
        }
    });

    // Mostrar vista previa al seleccionar imagen
    fotoInput.addEventListener('change', (e) => {
        const archivo = e.target.files[0];
        if (archivo) {
            const reader = new FileReader();
            reader.onload = (event) => {
                previewImg.src = event.target.result;
                previewBox.style.display = 'flex';
            };
            reader.readAsDataURL(archivo);
        }
    });

    // Quitar imagen seleccionada
    function limpiarPreview() {
        fotoInput.value = '';
        previewImg.src = '';
        previewBox.style.display = 'none';
    }

    btnRemoveImg.addEventListener('click', limpiarPreview);

    // Publicar nuevo mensaje o foto
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const texto = textoInput.value.trim();
        const archivoFoto = fotoInput.files[0];

        if (texto === '' && !archivoFoto) return;

        let fotoHTML = '';
        if (archivoFoto) {
            const urlTemporal = URL.createObjectURL(archivoFoto);
            fotoHTML = `<div class="post-photo"><img src="${urlTemporal}" alt="Foto publicada"></div>`;
        }

        const nuevoPost = document.createElement('article');
        nuevoPost.className = 'post-card';
        nuevoPost.innerHTML = `
            <div class="post-top">
                <div class="user-avatar">A</div>
                <div class="user-meta">
                    <strong>Aladar</strong>
                    <span>ahora mismo</span>
                </div>
            </div>
            ${texto !== '' ? `<p class="post-caption">${escapeHTML(texto)}</p>` : ''}
            ${fotoHTML}
            <div class="post-footer">
                <button class="btn-like">🤍 <span class="count">0</span></button>
                <button class="btn-comment">💬 <span class="count">0</span></button>
            </div>
        `;

        feed.appendChild(nuevoPost);
        feed.scrollTop = feed.scrollHeight;

        textoInput.value = '';
        limpiarPreview();
    });

    // Evitar inyección de código HTML en el texto del usuario
    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('estela-neon');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let puntos = [];
    const maxPuntos = 22; // Largo de la estela

    function ajustarTamano() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    ajustarTamano();
    window.addEventListener('resize', ajustarTamano);

    document.addEventListener('mousemove', (e) => {
        puntos.push({
            x: e.clientX,
            y: e.clientY,
            vida: 1
        });

        if (puntos.length > maxPuntos) {
            puntos.shift();
        }
    });

    function dibujarEstela() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (puntos.length > 1) {
            for (let i = 1; i < puntos.length; i++) {
                const p1 = puntos[i - 1];
                const p2 = puntos[i];
                const progreso = i / puntos.length;

                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);

                // Estilo verde neón BeCool (#b4f022)
                ctx.strokeStyle = `rgba(180, 240, 34, ${progreso * p2.vida})`;
                ctx.lineWidth = progreso * 6; // Más grueso cerca del cursor, fino al final
                ctx.lineCap = 'round';
                ctx.shadowBlur = 14;
                ctx.shadowColor = '#b4f022';
                ctx.stroke();
            }
        }

        // Desvanecer la estela cuando el mouse se detiene
        for (let i = 0; i < puntos.length; i++) {
            puntos[i].vida -= 0.04;
        }
        puntos = puntos.filter(p => p.vida > 0);

        requestAnimationFrame(dibujarEstela);
    }

    dibujarEstela();
});