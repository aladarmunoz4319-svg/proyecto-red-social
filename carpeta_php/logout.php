<?php
// Cierra la sesión y manda al login
session_start();
$_SESSION = [];
session_destroy();

header('Location: ../index.html');
exit;