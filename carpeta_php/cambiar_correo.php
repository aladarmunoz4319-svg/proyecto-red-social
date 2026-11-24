<?php
require __DIR__ . "/comun.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    responder(["success" => false, "message" => "Método no permitido."], 405);
}

$email    = trim($_POST["email"] ?? "");
$password = $_POST["password"] ?? "";

if ($email === "" || $password === "") {
    responder(["success" => false, "message" => "Completa los dos campos."], 400);
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($email) > 100) {
    responder(["success" => false, "message" => "Escribe un correo válido."], 400);
}

$st = $conexion->prepare("SELECT email, password_hash FROM usuarios WHERE id = ?");
$st->bind_param("i", $usuarioId);
$st->execute();
$actual = $st->get_result()->fetch_assoc();

if (!password_verify($password, $actual["password_hash"])) {
    responder(["success" => false, "message" => "La contraseña no es correcta."], 403);
}
if (strcasecmp($email, $actual["email"]) === 0) {
    responder(["success" => false, "message" => "Ese ya es tu correo."], 400);
}

$st = $conexion->prepare("SELECT id FROM usuarios WHERE email = ? AND id <> ?");
$st->bind_param("si", $email, $usuarioId);
$st->execute();
if ($st->get_result()->fetch_assoc()) {
    responder(["success" => false, "message" => "Ese correo ya está registrado."], 409);
}

$st = $conexion->prepare("UPDATE usuarios SET email = ? WHERE id = ?");
$st->bind_param("si", $email, $usuarioId);
$st->execute();

responder(["success" => true, "message" => "Correo actualizado.", "email" => $email]);