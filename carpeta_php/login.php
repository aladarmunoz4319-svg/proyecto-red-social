<?php require __DIR__ . "/sesion.php"; ?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="app.js" defer></script>
    <title>Becool | Inicio</title>

    <!-- Estilos de esta página -->
    <link rel="stylesheet" href="../css/styletwo.css">

    <!-- GSAP (gratis, incluye todos sus plugins) y ScrollTrigger: animaciones al bajar -->
    <script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/ScrollTrigger.min.js"></script>

    <!-- Nuestro JS: va en el head para que no haya parpadeo al cargar -->
    <script src="../inicio.js"></script>
</head>
<body>

    <?php
    $paginaActiva = "inicio";
    include __DIR__ . "/sidebar.php";
    ?>

    <!-- ============ CONTENIDO ============ -->
    <div class="contenido">

        <header class="topbar">
            <label class="buscador">
                <svg class="icono"><use href="#i-search"/></svg>
                <input type="search" placeholder="Buscar comunidades o personas" aria-label="Buscar">
                <kbd>/</kbd>
            </label>
        </header>

        <main class="layout">

            <!-- Columna principal -->
            <section class="feed">

                <header class="hero">
                    <h1 class="hero-titulo reveal-text">Hola, <span class="acento"><?= $nombre ?></span></h1>
                    <p class="hero-sub reveal-text">Esto es lo nuevo en tus comunidades.</p>
                </header>

                <!-- Filtro con "pastilla" que se desliza -->
                <div class="tabs" role="group" aria-label="Filtrar publicaciones">
                    <span class="tabs-pill" aria-hidden="true"></span>
                    <button type="button" class="tab" data-filtro="todo" aria-pressed="true">Para ti</button>
                    <button type="button" class="tab" data-filtro="musica" aria-pressed="false">Música</button>
                    <button type="button" class="tab" data-filtro="deportes" aria-pressed="false">Deportes</button>
                    <button type="button" class="tab" data-filtro="memes" aria-pressed="false">Memes</button>
                </div>

                <!-- Nueva publicación: área abierta, sin caja -->
                <form class="composer reveal">
                    <span class="avatar"><?= $inicial ?></span>
                    <textarea placeholder="¿Qué quieres compartir hoy?" rows="2" aria-label="Escribe tu publicación"></textarea>
                    <button type="submit" class="btn-publicar">Publicar</button>
                </form>

                <!-- Publicaciones: filas abiertas separadas por una línea fina -->
                <article class="post reveal" data-comunidad="musica">
                    <span class="avatar">A</span>
                    <div class="post-cuerpo">
                        <div class="post-cab"><strong>Aladar</strong><span>en Música · hace 5 min</span></div>
                        <p>Primera publicación de prueba en Becool. Si ves esto, el login, la base de datos y el correo ya funcionan.</p>
                        <div class="post-acciones">
                            <button type="button" class="accion" data-like aria-pressed="false" aria-label="Me gusta">
                                <svg class="icono"><use href="#i-heart"/></svg><span class="num">12</span>
                            </button>
                            <button type="button" class="accion" aria-label="Comentarios">
                                <svg class="icono"><use href="#i-comment"/></svg><span class="num">3</span>
                            </button>
                        </div>
                    </div>
                </article>

                <article class="post reveal" data-comunidad="memes">
                    <span class="avatar">M</span>
                    <div class="post-cuerpo">
                        <div class="post-cab"><strong>Maurix</strong><span>en Memes · hace 1 h</span></div>
                        <p>Cuando por fin te funciona el login después de dos días de pelearte con la ruta del CSS.</p>
                        <div class="post-acciones">
                            <button type="button" class="accion" data-like aria-pressed="false" aria-label="Me gusta">
                                <svg class="icono"><use href="#i-heart"/></svg><span class="num">48</span>
                            </button>
                            <button type="button" class="accion" aria-label="Comentarios">
                                <svg class="icono"><use href="#i-comment"/></svg><span class="num">9</span>
                            </button>
                        </div>
                    </div>
                </article>

                <article class="post reveal" data-comunidad="deportes">
                    <span class="avatar">A</span>
                    <div class="post-cuerpo">
                        <div class="post-cab"><strong>Ana</strong><span>en Deportes · hace 2 h</span></div>
                        <p>Qué partidazo el de anoche. Ese gol en el último minuto todavía me tiene sin palabras.</p>
                        <div class="post-acciones">
                            <button type="button" class="accion" data-like aria-pressed="false" aria-label="Me gusta">
                                <svg class="icono"><use href="#i-heart"/></svg><span class="num">31</span>
                            </button>
                            <button type="button" class="accion" aria-label="Comentarios">
                                <svg class="icono"><use href="#i-comment"/></svg><span class="num">14</span>
                            </button>
                        </div>
                    </div>
                </article>

                <article class="post reveal" data-comunidad="musica">
                    <span class="avatar">L</span>
                    <div class="post-cuerpo">
                        <div class="post-cab"><strong>Luis</strong><span>en Música · hace 3 h</span></div>
                        <p>Recomiéndenme discos para estudiar. Que no tengan letra, porque me distraigo cantando.</p>
                        <div class="post-acciones">
                            <button type="button" class="accion" data-like aria-pressed="false" aria-label="Me gusta">
                                <svg class="icono"><use href="#i-heart"/></svg><span class="num">22</span>
                            </button>
                            <button type="button" class="accion" aria-label="Comentarios">
                                <svg class="icono"><use href="#i-comment"/></svg><span class="num">27</span>
                            </button>
                        </div>
                    </div>
                </article>

                <article class="post reveal" data-comunidad="memes">
                    <span class="avatar">S</span>
                    <div class="post-cuerpo">
                        <div class="post-cab"><strong>Sofía</strong><span>en Memes · hace 5 h</span></div>
                        <p>Mi cara cuando el código dice "Not Found" y el archivo está justo ahí, en otra carpeta.</p>
                        <div class="post-acciones">
                            <button type="button" class="accion" data-like aria-pressed="false" aria-label="Me gusta">
                                <svg class="icono"><use href="#i-heart"/></svg><span class="num">67</span>
                            </button>
                            <button type="button" class="accion" aria-label="Comentarios">
                                <svg class="icono"><use href="#i-comment"/></svg><span class="num">11</span>
                            </button>
                        </div>
                    </div>
                </article>

                <article class="post reveal" data-comunidad="deportes">
                    <span class="avatar">D</span>
                    <div class="post-cuerpo">
                        <div class="post-cab"><strong>Diego</strong><span>en Deportes · ayer</span></div>
                        <p>¿Quién se apunta a armar un torneo de fútbol rápido el fin de semana? Ya tengo la cancha.</p>
                        <div class="post-acciones">
                            <button type="button" class="accion" data-like aria-pressed="false" aria-label="Me gusta">
                                <svg class="icono"><use href="#i-heart"/></svg><span class="num">18</span>
                            </button>
                            <button type="button" class="accion" aria-label="Comentarios">
                                <svg class="icono"><use href="#i-comment"/></svg><span class="num">35</span>
                            </button>
                        </div>
                    </div>
                </article>
            </section>

            <!-- Columna derecha: sugerencias, sin caja -->
            <aside class="derecha reveal">
                <p class="etiqueta">Sugerido para ti</p>

                <a href="../indexchatmusic.html" class="chat">
                    <span class="chat-icono"><svg class="icono"><use href="#i-music"/></svg></span>
                    <span class="chat-info">
                        <strong>Música</strong>
                        <small>1,240 miembros</small>
                    </span>
                </a>

                <a href="../indexchatsport.html" class="chat">
                    <span class="chat-icono"><svg class="icono"><use href="#i-ball"/></svg></span>
                    <span class="chat-info">
                        <strong>Deportes</strong>
                        <small>860 miembros</small>
                    </span>
                </a>

                <a href="../indexchatmemes.html" class="chat">
                    <span class="chat-icono"><svg class="icono"><use href="#i-smile"/></svg></span>
                    <span class="chat-info">
                        <strong>Memes</strong>
                        <small>2,310 miembros</small>
                    </span>
                </a>
            </aside>
        </main>
    </div>
</body>
</html>