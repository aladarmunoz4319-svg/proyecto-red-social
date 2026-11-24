<?php

require __DIR__ . "/comun.php";

$slug  = strtolower(trim($_REQUEST["comunidad"] ?? ""));
$canal = obtenerCanal($conexion, $slug);
if (!$canal) {
    responder(["success" => false, "message" => "Esa comunidad no existe."], 404);
}

// VER LAS PUBLICACIONES
if ($_SERVER["REQUEST_METHOD"] === "GET") {
    $despues = (int) ($_GET["despues"] ?? 0);
    responder([
        "success"       => true,
        "canal"         => $canal,
        "publicaciones" => traerPublicaciones($conexion, $usuarioId, $canal["id"], $despues),
    ]);
}

// CREAR PUBLICACIONES
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    responder(["success" => false, "message" => "Método no permitido."], 405);
}

$contenido = trim($_POST["contenido"] ?? "");
$hayFoto   = isset($_FILES["imagen"]) && $_FILES["imagen"]["error"] !== UPLOAD_ERR_NO_FILE;

if ($contenido === "" && !$hayFoto) {
    responder(["success" => false, "message" => "Escribe algo o sube una foto."], 400);
}
if (mb_strlen($contenido) > 1000) {
    responder(["success" => false, "message" => "El texto es muy largo (máximo 1000 letras)."], 400);
}

$ruta = null;
if ($hayFoto) {
    $f = $_FILES["imagen"];
    if ($f["error"] !== UPLOAD_ERR_OK) {
        responder(["success" => false, "message" => "No se pudo subir la imagen."], 400);
    }
    if ($f["size"] > 4 * 1024 * 1024) {
        responder(["success" => false, "message" => "La imagen pesa más de 4 MB."], 400);
    }

    // Revisamos el CONTENIDO del archivo (no el nombre): tiene que ser una imagen de verdad
    $info  = @getimagesize($f["tmp_name"]);
    $tipos = ["image/jpeg" => "jpg", "image/png" => "png", "image/webp" => "webp", "image/gif" => "gif"];
    if ($info === false || !isset($tipos[$info["mime"]])) {
        responder(["success" => false, "message" => "Solo se permiten fotos JPG, PNG, WEBP o GIF."], 400);
    }

    $carpeta = dirname(__DIR__) . "/subidas";
    if (!is_dir($carpeta)) {
        mkdir($carpeta, 0755, true);
    }
    // Nombre al azar, nadie puede adivinarlo ni sobrescribir otra foto
    $nombreArchivo = bin2hex(random_bytes(8)) . "." . $tipos[$info["mime"]];
    if (!move_uploaded_file($f["tmp_name"], $carpeta . "/" . $nombreArchivo)) {
        responder(["success" => false, "message" => "No se pudo guardar la imagen."], 500);
    }
    $ruta = "subidas/" . $nombreArchivo;   // esto es lo que se guarda en la base
}

$st = $conexion->prepare("INSERT INTO publicaciones (id_usuario, id_canal, contenido, imagen) VALUES (?, ?, ?, ?)");
$st->bind_param("iiss", $usuarioId, $canal["id"], $contenido, $ruta);
$st->execute();
$nuevoId = $conexion->insert_id;

$nueva = null;
foreach (traerPublicaciones($conexion, $usuarioId, $canal["id"], $nuevoId - 1) as $p) {
    if ($p["id"] === (int) $nuevoId) {
        $nueva = $p;
    }
}
responder(["success" => true, "publicacion" => $nueva]);