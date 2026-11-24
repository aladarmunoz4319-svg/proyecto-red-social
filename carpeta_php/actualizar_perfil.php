<?php
require __DIR__ . "/comun.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    responder(["success" => false, "message" => "Método no permitido."], 405);
}

$username = trim($_POST["username"] ?? "");
$bio      = trim($_POST["bio"] ?? "");
$quitar   = ($_POST["quitar_avatar"] ?? "0") === "1";

if (!preg_match('/^[\p{L}\p{N}_.\-]{3,30}$/u', $username)) {
    responder(["success" => false, "message" => "El nombre de usuario debe tener de 3 a 30 caracteres: letras, números, punto, guion o guion bajo (sin espacios)."], 400);
}
if (mb_strlen($bio) > 200) {
    responder(["success" => false, "message" => "La biografía es muy larga (máximo 200 letras)."], 400);
}

$actual = datosUsuario($conexion, $usuarioId);

// Que nadie más tenga ese nombre
if ($username !== $actual["username"]) {
    $st = $conexion->prepare("SELECT id FROM usuarios WHERE username = ? AND id <> ?");
    $st->bind_param("si", $username, $usuarioId);
    $st->execute();
    if ($st->get_result()->fetch_assoc()) {
        responder(["success" => false, "message" => "Ese nombre de usuario ya está en uso."], 409);
    }
}

// Foto: una nueva reemplaza a la vieja; "quitar" la deja sin foto
$avatar = $actual["avatar"];
$subio  = isset($_FILES["avatar"]) && $_FILES["avatar"]["error"] !== UPLOAD_ERR_NO_FILE;

if ($subio) {
    [$ruta, $error] = guardarImagenSubida($_FILES["avatar"], "avatares", 2);
    if ($error) {
        responder(["success" => false, "message" => $error], 400);
    }
    borrarAvatarViejo($avatar);
    $avatar = $ruta;
} elseif ($quitar) {
    borrarAvatarViejo($avatar);
    $avatar = null;
}

$bioGuardar = $bio === "" ? null : $bio;
$st = $conexion->prepare("UPDATE usuarios SET username = ?, bio = ?, avatar = ? WHERE id = ?");
$st->bind_param("sssi", $username, $bioGuardar, $avatar, $usuarioId);
$st->execute();

$_SESSION["username"] = $username;

responder([
    "success" => true,
    "message" => "Cambios guardados.",
    "usuario" => datosUsuario($conexion, $usuarioId),
]);