<?php
require __DIR__ . "/comun.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    responder(["success" => false, "message" => "Método no permitido."], 405);
}

$actual  = $_POST["actual"] ?? "";
$nueva   = $_POST["nueva"] ?? "";
$repetir = $_POST["repetir"] ?? "";

if ($actual === "" || $nueva === "" || $repetir === "") {
    responder(["success" => false, "message" => "Completa los tres campos."], 400);
}
if (strlen($nueva) < 8) {
    responder(["success" => false, "message" => "La contraseña nueva debe tener al menos 8 caracteres."], 400);
}
if (strlen($nueva) > 72) {   // límite de bcrypt
    responder(["success" => false, "message" => "La contraseña nueva es demasiado larga (máximo 72)."], 400);
}
if ($nueva !== $repetir) {
    responder(["success" => false, "message" => "Las contraseñas nuevas no coinciden."], 400);
}

$st = $conexion->prepare("SELECT password_hash FROM usuarios WHERE id = ?");
$st->bind_param("i", $usuarioId);
$st->execute();
$fila = $st->get_result()->fetch_assoc();

if (!password_verify($actual, $fila["password_hash"])) {
    responder(["success" => false, "message" => "La contraseña actual no es correcta."], 403);
}
if ($actual === $nueva) {
    responder(["success" => false, "message" => "La contraseña nueva debe ser distinta a la actual."], 400);
}

$hash = password_hash($nueva, PASSWORD_DEFAULT);
$st = $conexion->prepare("UPDATE usuarios SET password_hash = ? WHERE id = ?");
$st->bind_param("si", $hash, $usuarioId);
$st->execute();

responder(["success" => true, "message" => "Contraseña actualizada."]);