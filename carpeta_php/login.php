<?php
session_start();
header("Content-Type: application/json; charset=utf-8");
require "conexion.php";

$email    = trim($_POST["email"] ?? "");
$password = $_POST["password"] ?? "";

if ($email === "" || $password === "") {
    echo json_encode(["success" => false, "message" => "Completa todos los campos."]);
    exit;
}

$stmt = $conexion->prepare("SELECT id, username, password_hash, rol FROM usuarios WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$fila = $stmt->get_result()->fetch_assoc();

if (!$fila) {
    echo json_encode(["success" => false, "noExiste" => true, "message" => "No existe esa cuenta."]);
    exit;
}

if (!password_verify($password, $fila["password_hash"])) {
    echo json_encode(["success" => false, "message" => "Correo o contraseña incorrectos."]);
    exit;
}

$_SESSION["usuario_id"] = $fila["id"];
$_SESSION["username"]   = $fila["username"];
$_SESSION["rol"]        = $fila["rol"];

echo json_encode(["success" => true, "redirect" => "indextwo.html"]);x