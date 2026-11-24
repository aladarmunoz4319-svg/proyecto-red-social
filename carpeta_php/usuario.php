<?php

session_start();
header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store");

if (!isset($_SESSION["usuario_id"])) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "No has iniciado sesión."]);
    exit;
}

require "conexion.php";

// Nunca mandamos password_hash solo lo que la página necesita
$stmt = $conexion->prepare("SELECT username, email, avatar, bio, rol, creado_en FROM usuarios WHERE id = ?");
$stmt->bind_param("i", $_SESSION["usuario_id"]);
$stmt->execute();
$usuario = $stmt->get_result()->fetch_assoc();

if (!$usuario) {
    session_destroy();
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "La cuenta ya no existe."]);
    exit;
}

echo json_encode(["success" => true, "usuario" => $usuario]);
// usuario.php devuelve en JSON los datos de quien tiene la sesión abierta.
// Lo usa js/sesion.js. Si no hay sesión, contesta 401.