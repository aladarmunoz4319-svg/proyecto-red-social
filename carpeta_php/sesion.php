<?php
// =====================================================================
// sesion.php: se incluye al inicio de cada página que requiere sesión.
//  1) Si no iniciaste sesión, te regresa al login.
//  2) Si sí, carga tus datos de la base de datos en $usuario.
// =====================================================================
session_start();

if (!isset($_SESSION["usuario_id"])) {
    header("Location: ../index.html");
    exit;
}

require __DIR__ . "/conexion.php";

$stmt = $conexion->prepare("SELECT id, username, email, avatar, bio, rol, creado_en FROM usuarios WHERE id = ?");
$stmt->bind_param("i", $_SESSION["usuario_id"]);
$stmt->execute();
$usuario = $stmt->get_result()->fetch_assoc();

// Si la cuenta ya no existe en la base, cerramos la sesión
if (!$usuario) {
    session_destroy();
    header("Location: ../index.html");
    exit;
}

// Versiones ya "seguras" para imprimir en HTML (evita que alguien meta código en su nombre)
$nombre  = htmlspecialchars($usuario["username"], ENT_QUOTES, "UTF-8");
$inicial = htmlspecialchars(mb_strtoupper(mb_substr($usuario["username"], 0, 1)), ENT_QUOTES, "UTF-8");