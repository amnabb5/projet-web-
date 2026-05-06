<?php
// database connection settings
$host = "localhost";
$dbname = "opal_store";
$user = "root";
$pass = "";

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $pass);
    // show errors so we can debug easier
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    // send back a json error if connection fails
    header('Content-Type: application/json');
    echo json_encode(["error" => "DB connection failed: " . $e->getMessage()]);
    exit;
}
?>
