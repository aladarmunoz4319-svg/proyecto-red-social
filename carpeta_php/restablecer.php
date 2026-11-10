<?php
header("Content-Type: application/json; charset=utf-8");
require "conexion.php";

$token    = $_POST["token"] ?? "";
$password = $_POST["password"] ?? "";

if ($token === "" || strlen($password) < 6) {
    echo json_encode(["success" => false, "message" => "La contraseña debe tener al menos 6 caracteres."]);
    exit;
}

$tokenHash = hash("sha256", $token);

$stmt = $conexion->prepare("SELECT id, usuario_id FROM recuperaciones WHERE token_hash = ? AND usado = 0 AND expira > NOW()");
$stmt->bind_param("s", $tokenHash);
$stmt->execute();
$fila = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$fila) {
    echo json_encode(["success" => false, "message" => "El enlace no es válido o ya expiró."]);
    exit;
}

$hash = password_hash($password, PASSWORD_DEFAULT);

$stmt = $conexion->prepare("UPDATE usuarios SET password_hash = ? WHERE id = ?");
$stmt->bind_param("si", $hash, $fila["usuario_id"]);
$stmt->execute();
$stmt->close();

$stmt = $conexion->prepare("UPDATE recuperaciones SET usado = 1 WHERE id = ?");
$stmt->bind_param("i", $fila["id"]);
$stmt->execute();

echo json_encode(["success" => true]);