<?php
header("Content-Type: application/json; charset=utf-8");
require "conexion.php";
require "enviar_correo.php";

$email = trim($_POST["email"] ?? "");

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["success" => false, "message" => "Correo no válido."]);
    exit;
}

$stmt = $conexion->prepare("SELECT id FROM usuarios WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$fila = $stmt->get_result()->fetch_assoc();
$stmt->close();

if ($fila) {
    $stmt = $conexion->prepare("UPDATE recuperaciones SET usado = 1 WHERE usuario_id = ?");
    $stmt->bind_param("i", $fila["id"]);
    $stmt->execute();
    $stmt->close();

    $token     = bin2hex(random_bytes(32));
    $tokenHash = hash("sha256", $token);

    $stmt = $conexion->prepare("INSERT INTO recuperaciones (usuario_id, token_hash, expira) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR))");
    $stmt->bind_param("is", $fila["id"], $tokenHash);
    $stmt->execute();
    $stmt->close();

    $enlace = URL_BASE . "/restablecer.html?token=" . $token;

    $html = "
        <h2>Recupera tu contraseña</h2>
        <p>Recibimos una solicitud para cambiar tu contraseña en Becool.</p>
        <p><a href=\"$enlace\">Cambiar mi contraseña</a></p>
        <p>Este enlace vence en 1 hora y solo se puede usar una vez.</p>
        <p>Si no fuiste tú, ignora este correo.</p>
    ";

    enviarCorreo($email, "Recupera tu contraseña de Becool", $html);
}

echo json_encode([
    "success" => true,
    "message" => "Si el correo está registrado, te enviamos un enlace para cambiar tu contraseña. Revisa también el spam."
]);