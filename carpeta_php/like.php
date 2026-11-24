<?php
require __DIR__ . "/comun.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    responder(["success" => false, "message" => "Método no permitido."], 405);
}

$idPublicacion = (int) ($_POST["publicacion"] ?? 0);

$st = $conexion->prepare("SELECT id FROM publicaciones WHERE id = ?");
$st->bind_param("i", $idPublicacion);
$st->execute();
if (!$st->get_result()->fetch_assoc()) {
    responder(["success" => false, "message" => "Esa publicación no existe."], 404);
}

// Primero intentamos quitar el like; si no había ninguno que quitar, lo agregamos
$st = $conexion->prepare("DELETE FROM likes WHERE id_usuario = ? AND id_publicacion = ?");
$st->bind_param("ii", $usuarioId, $idPublicacion);
$st->execute();
$liked = false;

if ($st->affected_rows === 0) {
    $st = $conexion->prepare("INSERT INTO likes (id_usuario, id_publicacion) VALUES (?, ?)");
    $st->bind_param("ii", $usuarioId, $idPublicacion);
    $st->execute();
    $liked = true;
}

$st = $conexion->prepare("SELECT COUNT(*) AS total FROM likes WHERE id_publicacion = ?");
$st->bind_param("i", $idPublicacion);
$st->execute();
$total = (int) $st->get_result()->fetch_assoc()["total"];

responder(["success" => true, "liked" => $liked, "likes" => $total]);