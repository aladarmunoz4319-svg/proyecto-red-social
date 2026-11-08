<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require __DIR__ . "/PHPMailer/src/Exception.php";
require __DIR__ . "/PHPMailer/src/PHPMailer.php";
require __DIR__ . "/PHPMailer/src/SMTP.php";
require __DIR__ . "/config_correo.php";

function enviarCorreo($destino, $asunto, $htmlCuerpo) {
    $mail = new PHPMailer(true);

    try {
        $mail->isSMTP();
        $mail->Host       = "smtp.gmail.com";
        $mail->SMTPAuth   = true;
        $mail->Username   = CORREO_USUARIO;
        $mail->Password   = CORREO_CLAVE;
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;
        $mail->CharSet    = "UTF-8";

        $mail->setFrom(CORREO_USUARIO, "Becool");
        $mail->addAddress($destino);

        $mail->isHTML(true);
        $mail->Subject = $asunto;
        $mail->Body    = $htmlCuerpo;

        $mail->send();
        return true;
    } catch (Exception $e) {
        error_log("Error al enviar correo: " . $mail->ErrorInfo);
        return false;
    }
}