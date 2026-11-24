<?php
ini_set("display_errors", "0");   // los errores van al log, no se mezclan con el JSON
session_start();
header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store");

function responder(array $datos, int $codigo = 200): void
{
    http_response_code($codigo);
    echo json_encode($datos, JSON_UNESCAPED_UNICODE);
    exit;
}

// Si algo truena (por ejemplo una consulta mal), contestamos JSON en vez de HTML
set_exception_handler(function (Throwable $e) {
    error_log($e->getMessage());
    responder(["success" => false, "message" => "Error del servidor. Intenta de nuevo."], 500);
});

if (!isset($_SESSION["usuario_id"])) {
    responder(["success" => false, "message" => "No has iniciado sesión."], 401);
}
$usuarioId = (int) $_SESSION["usuario_id"];

require __DIR__ . "/conexion.php";
$conexion->set_charset("utf8mb4");

// Comunidades de Becool: lo que va en la URL (?c=musica) -> nombre y descripción.
// La base de datos ignora acentos y mayúsculas, así que "Musica" también encuentra "Música".
const COMUNIDADES = [
    "musica"    => ["Música",    "Discos, conciertos y recomendaciones"],
    "deportes"  => ["Deportes",  "Jugadas, partidos y todo lo del deporte"],
    "memes"     => ["Memes",     "Lo mejor del humor de la comunidad"],
];

// Busca el canal de una comunidad. Si la comunidad o su canal no existen todavía,
// los crea (así no tienes que insertar nada a mano en phpMyAdmin).
function obtenerCanal($db, string $slug): ?array
{
    if (!isset(COMUNIDADES[$slug])) {
        return null;
    }
    [$nombre, $descripcion] = COMUNIDADES[$slug];

    $st = $db->prepare("SELECT id, nombre FROM comunidades WHERE nombre = ? LIMIT 1");
    $st->bind_param("s", $nombre);
    $st->execute();
    $comunidad = $st->get_result()->fetch_assoc();

    if (!$comunidad) {
        $st = $db->prepare("INSERT INTO comunidades (nombre, lema) VALUES (?, ?)");
        $st->bind_param("ss", $nombre, $descripcion);
        $st->execute();
        $comunidad = ["id" => $db->insert_id, "nombre" => $nombre];
    }

    $st = $db->prepare("SELECT id, descripcion FROM canales WHERE id_comunidad = ? ORDER BY id LIMIT 1");
    $st->bind_param("i", $comunidad["id"]);
    $st->execute();
    $canal = $st->get_result()->fetch_assoc();

    if (!$canal) {
        $nombreCanal = "General";
        $st = $db->prepare("INSERT INTO canales (id_comunidad, nombre, descripcion) VALUES (?, ?, ?)");
        $st->bind_param("iss", $comunidad["id"], $nombreCanal, $descripcion);
        $st->execute();
        $canal = ["id" => $db->insert_id, "descripcion" => $descripcion];
    }

    return [
        "id"          => (int) $canal["id"],
        "slug"        => $slug,
        "nombre"      => $comunidad["nombre"],
        "descripcion" => $canal["descripcion"] ?: $descripcion,
    ];
}

// Publicaciones de un canal (las más nuevas primero), con sus likes y comentarios.
// $despues > 0 -> solo las que tengan un id mayor (sirve para pedir "lo nuevo").
function traerPublicaciones($db, int $usuarioId, int $canalId, int $despues = 0): array
{
    $sql = "SELECT p.id, p.contenido, p.imagen, UNIX_TIMESTAMP(p.creado_en) AS ts,
                   p.id_usuario AS autor_id, u.username AS autor, u.avatar AS autor_avatar,
                   (SELECT COUNT(*) FROM likes l WHERE l.id_publicacion = p.id) AS likes,
                   (SELECT COUNT(*) FROM comentarios c WHERE c.id_publicacion = p.id) AS comentarios,
                   (SELECT COUNT(*) FROM likes l2 WHERE l2.id_publicacion = p.id AND l2.id_usuario = ?) AS yo_like
            FROM publicaciones p
            JOIN usuarios u ON u.id = p.id_usuario
            WHERE p.id_canal = ? AND p.id > ?
            ORDER BY p.id DESC
            LIMIT 50";
    $st = $db->prepare($sql);
    $st->bind_param("iii", $usuarioId, $canalId, $despues);
    $st->execute();

    $lista = [];
    $res = $st->get_result();
    while ($f = $res->fetch_assoc()) {
        $lista[] = [
            "id"          => (int) $f["id"],
            "autor"       => $f["autor"],
            "autor_id"    => (int) $f["autor_id"],
            "autor_avatar" => $f["autor_avatar"],
            "contenido"   => $f["contenido"],
            "imagen"      => $f["imagen"],
            "ts"          => (int) $f["ts"],
            "likes"       => (int) $f["likes"],
            "comentarios" => (int) $f["comentarios"],
            "yo_like"     => ((int) $f["yo_like"]) > 0,
        ];
    }
    return $lista;
}

// Guarda una imagen subida en subidas/<subcarpeta>/ y devuelve [ruta, error].
function guardarImagenSubida(array $archivo, string $subcarpeta, int $maxMb): array
{
    if ($archivo["error"] !== UPLOAD_ERR_OK) {
        return [null, "No se pudo subir la imagen."];
    }
    if ($archivo["size"] > $maxMb * 1024 * 1024) {
        return [null, "La imagen pesa más de " . $maxMb . " MB."];
    }

    // Revisamos el CONTENIDO del archivo (no el nombre): tiene que ser una imagen de verdad
    $info  = @getimagesize($archivo["tmp_name"]);
    $tipos = ["image/jpeg" => "jpg", "image/png" => "png", "image/webp" => "webp", "image/gif" => "gif"];
    if ($info === false || !isset($tipos[$info["mime"]])) {
        return [null, "Solo se permiten fotos JPG, PNG, WEBP o GIF."];
    }

    $carpeta = dirname(__DIR__) . "/subidas/" . $subcarpeta;
    if (!is_dir($carpeta)) {
        mkdir($carpeta, 0755, true);
    }
    $nombre = bin2hex(random_bytes(8)) . "." . $tipos[$info["mime"]];   // nombre al azar
    if (!move_uploaded_file($archivo["tmp_name"], $carpeta . "/" . $nombre)) {
        return [null, "No se pudo guardar la imagen."];
    }
    return ["subidas/" . $subcarpeta . "/" . $nombre, null];
}

// Borra una foto de perfil vieja (solo si la ruta tiene el formato que nosotros generamos)
function borrarAvatarViejo(?string $ruta): void
{
    if ($ruta && preg_match('#^subidas/avatares/[a-f0-9]{16}\.(jpg|png|webp|gif)$#', $ruta)) {
        $archivo = dirname(__DIR__) . "/" . $ruta;
        if (is_file($archivo)) {
            @unlink($archivo);
        }
    }
}

// Los datos del usuario, tal como los necesita la página (nunca el password_hash)
function datosUsuario($db, int $id): array
{
    $st = $db->prepare("SELECT username, email, avatar, bio, rol, creado_en FROM usuarios WHERE id = ?");
    $st->bind_param("i", $id);
    $st->execute();
    return $st->get_result()->fetch_assoc();
}