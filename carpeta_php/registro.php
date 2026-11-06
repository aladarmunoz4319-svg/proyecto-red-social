<?php
header("Content-Type: application/json; charset=utf-8");
require "conexion.php";

$username = trim($_POST["username"] ?? "");
$email    = trim($_POST["email"] ?? "");
$password = $_POST["password"] ?? "";

if ($username === "" || $email === "" || $password === "") {
    echo json_encode(["success" => false, "message" => "Completa todos los campos."]);
    exit;
}

if (strlen($username) < 3 || strlen($username) > 30) {
    echo json_encode(["success" => false, "message" => "El usuario debe tener entre 3 y 30 caracteres."]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["success" => false, "message" => "Correo no válido."]);
    exit;
}

if (strlen($password) < 6) {
    echo json_encode(["success" => false, "message" => "La contraseña debe tener al menos 6 caracteres."]);
    exit;
}

// Esto sevisa si ya existe el usuario o el correo      
$stmt = $conexion->prepare("SELECT id FROM usuarios WHERE username = ? OR email = ?");
$stmt->bind_param("ss", $username, $email);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
    echo json_encode(["success" => false, "message" => "Ese usuario o correo ya está registrado."]);
    exit;
}
$stmt->close();

$hash = password_hash($password, PASSWORD_DEFAULT);

$stmt = $conexion->prepare("INSERT INTO usuarios (username, email, password_hash) VALUES (?, ?, ?)");
$stmt->bind_param("sss", $username, $email, $hash);

if ($stmt->execute()) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "message" => "No se pudo crear la cuenta."]);
}