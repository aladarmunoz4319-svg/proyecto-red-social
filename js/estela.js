(function () {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const canvas = document.createElement('canvas');
    canvas.className = 'estela-neon';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const MAX_PUNTOS = 5;          // largo de la estela
    let puntos = [];
    let animando = false;

    function ajustarTamano() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    ajustarTamano();
    window.addEventListener('resize', ajustarTamano);

    document.addEventListener('mousemove', (e) => {
        puntos.push({ x: e.clientX, y: e.clientY, vida: 1 });
        if (puntos.length > MAX_PUNTOS) puntos.shift();

        if (!animando) {
            animando = true;
            requestAnimationFrame(dibujar);
        }
    });

    function dibujar() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 1; i < puntos.length; i++) {
            const p1 = puntos[i - 1];
            const p2 = puntos[i];
            const progreso = i / puntos.length;

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = 'rgba(180, 228, 31, ' + (progreso * p2.vida) + ')';   // el lima de Becool
            ctx.lineWidth = progreso * 6;       // grueso junto al cursor, fino al final
            ctx.lineCap = 'round';
            ctx.shadowBlur = 14;
            ctx.shadowColor = '#b4e41f';
            ctx.stroke();
        }

        // La estela se desvanece cuando el mouse se detiene
        puntos.forEach((p) => { p.vida -= 0.04; });
        puntos = puntos.filter((p) => p.vida > 0);

        if (puntos.length > 0) {
            requestAnimationFrame(dibujar);
        } else {
            animando = false;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
})();