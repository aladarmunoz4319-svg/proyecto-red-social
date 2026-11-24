<?php
require __DIR__ . "/comun.php";

function formatearComentario(array $f): array
{
    return [
        "id"    => (int) $f["id"],
        "autor" => $f["autor"],
        "autor_avatar" => $f["autor_avatar"],
        "texto" => $f["texto"],
        "ts"    => (int) $f["ts"],
    ];
}

$idPublicacion = (int) ($_REQUEST["publicacion"] ?? 0);

$st = $conexion->prepare("SELECT id FROM publicaciones WHERE id = ?");
$st->bind_param("i", $idPublicacion);
$st->execute();
if (!$st->get_result()->fetch_assoc()) {
    responder(["success" => false, "message" => "Esa publicación no existe."], 404);
}

// comentarios
if ($_SERVER["REQUEST_METHOD"] === "GET") {
    $st = $conexion->prepare(
        "SELECT c.id, c.texto, u.username AS autor, u.avatar AS autor_avatar, UNIX_TIMESTAMP(c.creado_en) AS ts
         FROM comentarios c JOIN usuarios u ON u.id = c.id_usuario
         WHERE c.id_publicacion = ? ORDER BY c.id ASC LIMIT 200"
    );
    $st->bind_param("i", $idPublicacion);
    $st->execute();
    $res = $st->get_result();
    $lista = [];
    while ($f = $res->fetch_assoc()) {
        $lista[] = formatearComentario($f);
    }
    responder(["success" => true, "comentarios" => $lista]);
}

// agregar comentario
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    responder(["success" => false, "message" => "Método no permitido."], 405);
}

$texto = trim($_POST["texto"] ?? "");
if ($texto === "") {
    responder(["success" => false, "message" => "Escribe tu comentario."], 400);
}
if (mb_strlen($texto) > 500) {
    responder(["success" => false, "message" => "El comentario es muy largo (máximo 500 letras)."], 400);
}

$st = $conexion->prepare("INSERT INTO comentarios (id_publicacion, id_usuario, texto) VALUES (?, ?, ?)");
$st->bind_param("iis", $idPublicacion, $usuarioId, $texto);
$st->execute();
$nuevoId = $conexion->insert_id;

$st = $conexion->prepare(
    "SELECT c.id, c.texto, u.username AS autor, u.avatar AS autor_avatar, UNIX_TIMESTAMP(c.creado_en) AS ts
     FROM comentarios c JOIN usuarios u ON u.id = c.id_usuario WHERE c.id = ?"
);
$st->bind_param("i", $nuevoId);
$st->execute();
$comentario = formatearComentario($st->get_result()->fetch_assoc());

$st = $conexion->prepare("SELECT COUNT(*) AS total FROM comentarios WHERE id_publicacion = ?");
$st->bind_param("i", $idPublicacion);
$st->execute();
$total = (int) $st->get_result()->fetch_assoc()["total"];

responder(["success" => true, "comentario" => $comentario, "total" => $total]);