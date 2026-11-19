<?php require "carpeta_php/sesion.php"; ?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Becool | Mi perfil</title>

    <!-- Estilos de esta página -->
    <link rel="stylesheet" href="css/styletwo.css">

    <!-- GSAP (gratis, incluye todos sus plugins) y ScrollTrigger: animaciones al bajar -->
    <script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/ScrollTrigger.min.js"></script>

    <!-- Nuestro JS: va en el head para que no haya parpadeo al cargar -->
    <script src="inicio.js"></script>
</head>
<body>

    <?php
    $paginaActiva = "perfil";
    include "carpeta_php/sidebar.php";

    // Fecha "creado_en" (2026-11-08 10:33:00) -> "8 de noviembre de 2026"
    $meses = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
    $f = strtotime($usuario["creado_en"]);
    $desde = date("j", $f) . " de " . $meses[date("n", $f) - 1] . " de " . date("Y", $f);

    $bio = trim($usuario["bio"] ?? "");
    ?>

    <div class="contenido">
        <main class="perfil-pagina">

            <header class="perfil-cab">
                <span class="avatar avatar-grande reveal-text"><?= $inicial ?></span>
                <div>
                    <h1 class="perfil-nombre reveal-text"><?= $nombre ?></h1>
                    <p class="perfil-sub reveal-text">Miembro desde <?= $desde ?></p>
                </div>
            </header>

            <section class="perfil-seccion reveal">
                <p class="etiqueta">Biografía</p>
                <?php if ($bio !== ""): ?>
                    <p class="perfil-bio"><?= nl2br(htmlspecialchars($bio, ENT_QUOTES, "UTF-8")) ?></p>
                <?php else: ?>
                    <p class="perfil-bio vacio">Todavía no escribes tu biografía.</p>
                <?php endif; ?>
            </section>

            <section class="perfil-seccion reveal">
                <p class="etiqueta">Datos de la cuenta</p>
                <dl class="perfil-datos">
                    <div><dt>Usuario</dt><dd><?= $nombre ?></dd></div>
                    <div><dt>Correo</dt><dd><?= htmlspecialchars($usuario["email"], ENT_QUOTES, "UTF-8") ?></dd></div>
                    <div><dt>Rol</dt><dd><?= htmlspecialchars($usuario["rol"], ENT_QUOTES, "UTF-8") ?></dd></div>
                    <div><dt>Miembro desde</dt><dd><?= $desde ?></dd></div>
                </dl>
            </section>

        </main>
    </div>
</body>
</html>