<?php
// stop php from injecting html errors into our json responses
ini_set("display_errors", 0);
error_reporting(0);
session_start();

require_once "db.php";

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE");
header("Access-Control-Allow-Headers: Content-Type");

$action = $_GET["action"] ?? "";

// for normal json requests
$body = json_decode(file_get_contents("php://input"), true) ?? [];

// -----------------------------------------------
// image upload - handles file upload separately
// -----------------------------------------------

if ($action === "upload_image") {
    if (empty($_SESSION["is_admin"])) {
        echo json_encode(["error" => "Not authorized"]);
        exit;
    }

    if (!isset($_FILES["image"])) {
        echo json_encode(["error" => "No file received"]);
        exit;
    }

    $file     = $_FILES["image"];
    $allowed  = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    $maxSize  = 5 * 1024 * 1024; // 5mb max

    if (!in_array($file["type"], $allowed)) {
        echo json_encode(["error" => "Only jpg, png, webp, gif are allowed"]);
        exit;
    }

    if ($file["size"] > $maxSize) {
        echo json_encode(["error" => "File is too big (max 5MB)"]);
        exit;
    }

    // give it a unique name so files dont overwrite each other
    $ext      = pathinfo($file["name"], PATHINFO_EXTENSION);
    $filename = "prod_" . time() . "_" . rand(100, 999) . "." . $ext;
    $dest     = __DIR__ . "/uploads/" . $filename;

    if (!move_uploaded_file($file["tmp_name"], $dest)) {
        echo json_encode(["error" => "Failed to save the file"]);
        exit;
    }

    // return the url path the browser can use
    echo json_encode(["success" => true, "url" => "uploads/" . $filename]);
    exit;
}

// -----------------------------------------------
// products
// -----------------------------------------------

if ($action === "get_products") {
    $stmt    = $pdo->query("SELECT * FROM products ORDER BY created_at DESC");
    $products = $stmt->fetchAll();

    foreach ($products as &$p) {
        $p["price"]        = (float)$p["price"];
        $p["customizable"] = (bool)$p["customizable"];
        $p["stock"]        = (int)$p["stock"];
    }

    echo json_encode($products);
    exit;
}

if ($action === "get_product") {
    $id   = $_GET["id"] ?? "";
    $stmt = $pdo->prepare("SELECT * FROM products WHERE id = ?");
    $stmt->execute([$id]);
    $p = $stmt->fetch();

    if (!$p) {
        echo json_encode(["error" => "Product not found"]);
        exit;
    }

    $p["price"]        = (float)$p["price"];
    $p["customizable"] = (bool)$p["customizable"];
    $p["stock"]        = (int)$p["stock"];
    echo json_encode($p);
    exit;
}

if ($action === "add_product") {
    if (empty($_SESSION["is_admin"])) {
        echo json_encode(["error" => "Not authorized"]);
        exit;
    }

    $name     = trim($body["name"] ?? "");
    $price    = (float)($body["price"] ?? 0);
    $category = trim($body["category"] ?? "");
    $image        = trim($body["image"] ?? "");
    $desc         = trim($body["description"] ?? "");
    $stock        = (int)($body["stock"] ?? 10);
    $customizable = !empty($body["customizable"]) ? 1 : 0;

    if (!$name || $price <= 0 || !$image || !$desc) {
        echo json_encode(["error" => "Missing required fields"]);
        exit;
    }

    if ($stock < 0) $stock = 0;

    $id   = "p" . time();
    $stmt = $pdo->prepare("INSERT INTO products (id, name, price, category, description, image, stock, customizable) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$id, $name, $price, $category, $desc, $image, $stock, $customizable]);

    echo json_encode(["success" => true, "id" => $id]);
    exit;
}

if ($action === "update_product") {
    if (empty($_SESSION["is_admin"])) {
        echo json_encode(["error" => "Not authorized"]);
        exit;
    }

    $id       = trim($body["id"] ?? "");
    $name     = trim($body["name"] ?? "");
    $price    = (float)($body["price"] ?? 0);
    $category = trim($body["category"] ?? "");
    $image        = trim($body["image"] ?? "");
    $desc         = trim($body["description"] ?? "");
    $stock        = (int)($body["stock"] ?? 0);
    $customizable = !empty($body["customizable"]) ? 1 : 0;

    if (!$id || !$name || $price <= 0) {
        echo json_encode(["error" => "Missing required fields"]);
        exit;
    }

    if ($stock < 0) $stock = 0;

    $stmt = $pdo->prepare("UPDATE products SET name=?, price=?, category=?, description=?, image=?, stock=?, customizable=? WHERE id=?");
    $stmt->execute([$name, $price, $category, $desc, $image, $stock, $customizable, $id]);

    echo json_encode(["success" => true]);
    exit;
}

if ($action === "delete_product") {
    if (empty($_SESSION["is_admin"])) {
        echo json_encode(["error" => "Not authorized"]);
        exit;
    }

    $id = trim($body["id"] ?? "");
    if (!$id) {
        echo json_encode(["error" => "No id given"]);
        exit;
    }

    $stmt = $pdo->prepare("DELETE FROM products WHERE id = ?");
    $stmt->execute([$id]);

    echo json_encode(["success" => true]);
    exit;
}

// -----------------------------------------------
// auth
// -----------------------------------------------

if ($action === "login") {
    $username = trim($body["username"] ?? "");
    $password = trim($body["password"] ?? "");

    if (!$username || !$password) {
        echo json_encode(["error" => "Username and password required"]);
        exit;
    }

    // plain text password check
    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ? AND password = ?");
    $stmt->execute([$username, $password]);
    $user = $stmt->fetch();

    if (!$user) {
        echo json_encode(["error" => "Wrong username or password"]);
        exit;
    }

    $_SESSION["user_id"]  = $user["id"];
    $_SESSION["username"] = $user["username"];
    $_SESSION["is_admin"] = (bool)$user["is_admin"];

    // cookie to remember username for 7 days
    setcookie("opal_username", $user["username"], time() + (7 * 24 * 60 * 60), "/");

    echo json_encode([
        "success"  => true,
        "username" => $user["username"],
        "isAdmin"  => (bool)$user["is_admin"]
    ]);
    exit;
}

if ($action === "logout") {
    session_destroy();
    setcookie("opal_username", "", time() - 3600, "/");
    echo json_encode(["success" => true]);
    exit;
}

if ($action === "check_session") {
    if (!empty($_SESSION["username"])) {
        echo json_encode([
            "loggedIn" => true,
            "username" => $_SESSION["username"],
            "isAdmin"  => (bool)$_SESSION["is_admin"]
        ]);
    } else {
        echo json_encode(["loggedIn" => false]);
    }
    exit;
}

if ($action === "register") {
    $username = trim($body["username"] ?? "");
    $password = trim($body["password"] ?? "");

    if (!$username || !$password) {
        echo json_encode(["error" => "Username and password are required"]);
        exit;
    }

    if (strlen($password) < 4) {
        echo json_encode(["error" => "Password must be at least 4 characters"]);
        exit;
    }

    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->execute([$username]);
    if ($stmt->fetch()) {
        echo json_encode(["error" => "Username already taken"]);
        exit;
    }

    // save plain text password
    $stmt = $pdo->prepare("INSERT INTO users (username, password, is_admin) VALUES (?, ?, 0)");
    $stmt->execute([$username, $password]);

    echo json_encode(["success" => true]);
    exit;
}

// -----------------------------------------------
// cart
// -----------------------------------------------

$sessionId = session_id();

if ($action === "get_cart") {
    $stmt  = $pdo->prepare("SELECT * FROM cart WHERE session_id = ?");
    $stmt->execute([$sessionId]);
    $items = $stmt->fetchAll();

    foreach ($items as &$item) {
        $item["quantity"] = (int)$item["quantity"];
        $item["variant"]  = $item["variant_data"] ? json_decode($item["variant_data"], true) : null;
        unset($item["variant_data"]);
    }

    echo json_encode($items);
    exit;
}

if ($action === "add_to_cart") {
    $cartKey   = trim($body["cartKey"] ?? "");
    $productId = trim($body["productId"] ?? "");
    $quantity  = (int)($body["quantity"] ?? 1);
    $variant   = $body["variant"] ?? null;
    $size      = trim($body["size"] ?? "");

    if (!$cartKey || !$productId) {
        echo json_encode(["error" => "Missing cart item data"]);
        exit;
    }

    // check stock before adding
    $stmt  = $pdo->prepare("SELECT stock FROM products WHERE id = ?");
    $stmt->execute([$productId]);
    $prod  = $stmt->fetch();

    if (!$prod) {
        echo json_encode(["error" => "Product not found"]);
        exit;
    }

    // get how many are already in cart
    $stmt2 = $pdo->prepare("SELECT quantity FROM cart WHERE session_id = ? AND cart_key = ?");
    $stmt2->execute([$sessionId, $cartKey]);
    $existing = $stmt2->fetch();
    $currentQty = $existing ? (int)$existing["quantity"] : 0;

    if ($currentQty + $quantity > $prod["stock"]) {
        echo json_encode(["error" => "Not enough stock. Only " . $prod["stock"] . " available."]);
        exit;
    }

    $variantJson = $variant ? json_encode($variant) : null;

    if ($existing) {
        $newQty = $currentQty + $quantity;
        $stmt3  = $pdo->prepare("UPDATE cart SET quantity = ? WHERE session_id = ? AND cart_key = ?");
        $stmt3->execute([$newQty, $sessionId, $cartKey]);
    } else {
        $stmt3 = $pdo->prepare("INSERT INTO cart (session_id, cart_key, product_id, quantity, variant_data, size) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt3->execute([$sessionId, $cartKey, $productId, $quantity, $variantJson, $size]);
    }

    echo json_encode(["success" => true]);
    exit;
}

if ($action === "update_cart") {
    $cartKey   = trim($body["cartKey"] ?? "");
    $quantity  = (int)($body["quantity"] ?? 1);
    $productId = trim($body["productId"] ?? "");

    if (!$cartKey) {
        echo json_encode(["error" => "No cart key"]);
        exit;
    }

    if ($quantity <= 0) {
        $stmt = $pdo->prepare("DELETE FROM cart WHERE session_id = ? AND cart_key = ?");
        $stmt->execute([$sessionId, $cartKey]);
    } else {
        // check stock before updating quantity
        if ($productId) {
            $stmt = $pdo->prepare("SELECT stock FROM products WHERE id = ?");
            $stmt->execute([$productId]);
            $prod = $stmt->fetch();
            if ($prod && $quantity > $prod["stock"]) {
                echo json_encode(["error" => "Only " . $prod["stock"] . " in stock", "maxStock" => $prod["stock"]]);
                exit;
            }
        }

        $stmt = $pdo->prepare("UPDATE cart SET quantity = ? WHERE session_id = ? AND cart_key = ?");
        $stmt->execute([$quantity, $sessionId, $cartKey]);
    }

    echo json_encode(["success" => true]);
    exit;
}

if ($action === "remove_from_cart") {
    $cartKey = trim($body["cartKey"] ?? "");
    $stmt    = $pdo->prepare("DELETE FROM cart WHERE session_id = ? AND cart_key = ?");
    $stmt->execute([$sessionId, $cartKey]);
    echo json_encode(["success" => true]);
    exit;
}

if ($action === "clear_cart") {
    $stmt = $pdo->prepare("DELETE FROM cart WHERE session_id = ?");
    $stmt->execute([$sessionId]);
    echo json_encode(["success" => true]);
    exit;
}

echo json_encode(["error" => "Unknown action: $action"]);
?>
