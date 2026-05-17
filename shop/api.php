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
    $image    = trim($body["image"] ?? "");
    $desc     = trim($body["description"] ?? "");
    $stock    = (int)($body["stock"] ?? 10);

    if (!$name || $price <= 0 || !$image || !$desc) {
        echo json_encode(["error" => "Missing required fields"]);
        exit;
    }

    if ($stock < 0) $stock = 0;

    $id   = "p" . time();
    $stmt = $pdo->prepare("INSERT INTO products (id, name, price, category, description, image, stock, customizable) VALUES (?, ?, ?, ?, ?, ?, ?, 0)");
    $stmt->execute([$id, $name, $price, $category, $desc, $image, $stock]);

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
    $image    = trim($body["image"] ?? "");
    $desc     = trim($body["description"] ?? "");
    $stock    = (int)($body["stock"] ?? 0);

    if (!$id || !$name || $price <= 0) {
        echo json_encode(["error" => "Missing required fields"]);
        exit;
    }

    if ($stock < 0) $stock = 0;

    $stmt = $pdo->prepare("UPDATE products SET name=?, price=?, category=?, description=?, image=?, stock=? WHERE id=?");
    $stmt->execute([$name, $price, $category, $desc, $image, $stock, $id]);

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
    $_SESSION["phone"]    = $user["phone"] ?? "";
    $_SESSION["address"]  = $user["address"] ?? "";

    // cookie to remember username for 7 days
    setcookie("opal_username", $user["username"], time() + (7 * 24 * 60 * 60), "/");

    echo json_encode([
        "success"  => true,
        "username" => $user["username"],
        "isAdmin"  => (bool)$user["is_admin"],
        "phone"    => $user["phone"] ?? "",
        "address"  => $user["address"] ?? ""
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
            "isAdmin"  => (bool)$_SESSION["is_admin"],
            "phone"    => $_SESSION["phone"] ?? "",
            "address"  => $_SESSION["address"] ?? ""
        ]);
    } else {
        echo json_encode(["loggedIn" => false]);
    }
    exit;
}

if ($action === "register") {
    $username = trim($body["username"] ?? "");
    $password = trim($body["password"] ?? "");
    $phone    = trim($body["phone"] ?? "");
    $address  = trim($body["address"] ?? "");

    if (!$username || !$password) {
        echo json_encode(["error" => "Username and password are required"]);
        exit;
    }

    if (strlen($password) < 4) {
        echo json_encode(["error" => "Password must be at least 4 characters"]);
        exit;
    }

    // Algerian phone number: 10 digits starting with 0
    if (!$phone) {
        echo json_encode(["error" => "Phone number is required"]);
        exit;
    }
    if (!preg_match('/^0[0-9]{9}$/', $phone)) {
        echo json_encode(["error" => "Phone number must be 10 digits and start with 0 (e.g. 0559734667)"]);
        exit;
    }

    if (!$address) {
        echo json_encode(["error" => "Address is required"]);
        exit;
    }

    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->execute([$username]);
    if ($stmt->fetch()) {
        echo json_encode(["error" => "Username already taken"]);
        exit;
    }

    // save plain text password
    $stmt = $pdo->prepare("INSERT INTO users (username, password, phone, address, is_admin) VALUES (?, ?, ?, ?, 0)");
    $stmt->execute([$username, $password, $phone, $address]);

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

if ($action === "checkout") {
    // user must be logged in to place an order
    if (empty($_SESSION["user_id"])) {
        echo json_encode(["error" => "Please login to checkout"]);
        exit;
    }

    // get all cart items for this session
    $stmt  = $pdo->prepare("SELECT * FROM cart WHERE session_id = ?");
    $stmt->execute([$sessionId]);
    $items = $stmt->fetchAll();

    if (empty($items)) {
        echo json_encode(["error" => "Your cart is empty"]);
        exit;
    }

    // calculate total and verify stock for each item
    $total = 0;
    $itemDetails = [];

    foreach ($items as $item) {
        $stmt2 = $pdo->prepare("SELECT * FROM products WHERE id = ?");
        $stmt2->execute([$item["product_id"]]);
        $product = $stmt2->fetch();

        if (!$product) continue;

        // double check stock is still available
        if ($product["stock"] < $item["quantity"]) {
            echo json_encode(["error" => "Sorry, " . $product["name"] . " only has " . $product["stock"] . " left in stock."]);
            exit;
        }

        $total += $product["price"] * $item["quantity"];
        $itemDetails[] = [
            "product"  => $product,
            "quantity" => $item["quantity"],
            "variant"  => $item["variant_data"] ? json_decode($item["variant_data"], true) : null,
            "size"     => $item["size"]
        ];
    }

    // create the order record - user info is fetched via user_id when needed
    $stmt = $pdo->prepare("INSERT INTO orders (user_id, total, status) VALUES (?, ?, 'pending')");
    $stmt->execute([$_SESSION["user_id"], $total]);
    $orderId = $pdo->lastInsertId();

    // save each item in order_items and reduce the stock
    foreach ($itemDetails as $detail) {
        $variantInfo = "";
        if ($detail["variant"]) {
            $variantInfo = $detail["variant"]["name"] ?? "";
        }
        if ($detail["size"]) {
            $variantInfo .= ($variantInfo ? " / " : "") . $detail["size"];
        }

        $stmt = $pdo->prepare("INSERT INTO order_items (order_id, product_id, product_name, price, quantity, variant_info) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $orderId,
            $detail["product"]["id"],
            $detail["product"]["name"],
            $detail["product"]["price"],
            $detail["quantity"],
            $variantInfo
        ]);

        // reduce stock
        $stmt = $pdo->prepare("UPDATE products SET stock = stock - ? WHERE id = ?");
        $stmt->execute([$detail["quantity"], $detail["product"]["id"]]);
    }

    // clear the cart after successful order
    $stmt = $pdo->prepare("DELETE FROM cart WHERE session_id = ?");
    $stmt->execute([$sessionId]);

    echo json_encode(["success" => true, "orderId" => $orderId, "total" => $total]);
    exit;
}

// get all orders - admin only
if ($action === "get_orders") {
    if (empty($_SESSION["is_admin"])) {
        echo json_encode(["error" => "Not authorized"]);
        exit;
    }

    // join with users to get customer info from the users table
    $stmt   = $pdo->query("SELECT o.*, u.username, u.phone, u.address FROM orders o LEFT JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC");
    $orders = $stmt->fetchAll();

    foreach ($orders as &$order) {
        // get the items for each order
        $stmt2 = $pdo->prepare("SELECT oi.*, p.image FROM order_items oi LEFT JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?");
        $stmt2->execute([$order["id"]]);
        $order["items"] = $stmt2->fetchAll();
        $order["total"] = (float)$order["total"];
    }

    echo json_encode($orders);
    exit;
}

if ($action === "update_order_status") {
    if (empty($_SESSION["is_admin"])) {
        echo json_encode(["error" => "Not authorized"]);
        exit;
    }

    $orderId = (int)($body["orderId"] ?? 0);
    $status  = trim($body["status"] ?? "");

    $allowed = ["pending", "done"];
    if (!$orderId || !in_array($status, $allowed)) {
        echo json_encode(["error" => "Invalid order or status"]);
        exit;
    }

    $stmt = $pdo->prepare("UPDATE orders SET status = ? WHERE id = ?");
    $stmt->execute([$status, $orderId]);

    echo json_encode(["success" => true]);
    exit;
}

// get current user profile
if ($action === "get_profile") {
    if (empty($_SESSION["user_id"])) {
        echo json_encode(["error" => "Not logged in"]);
        exit;
    }

    $stmt = $pdo->prepare("SELECT username, phone, address FROM users WHERE id = ?");
    $stmt->execute([$_SESSION["user_id"]]);
    $user = $stmt->fetch();

    if (!$user) {
        echo json_encode(["error" => "User not found"]);
        exit;
    }

    echo json_encode($user);
    exit;
}

// update current user profile
if ($action === "update_profile") {
    if (empty($_SESSION["user_id"])) {
        echo json_encode(["error" => "Not logged in"]);
        exit;
    }

    $username    = trim($body["username"] ?? "");
    $phone       = trim($body["phone"] ?? "");
    $address     = trim($body["address"] ?? "");
    $newPassword = trim($body["password"] ?? "");

    if (!$username) {
        echo json_encode(["error" => "Username is required"]);
        exit;
    }

    // Algerian phone number validation
    if (!$phone) {
        echo json_encode(["error" => "Phone number is required"]);
        exit;
    }
    if (!preg_match('/^0[0-9]{9}$/', $phone)) {
        echo json_encode(["error" => "Phone number must be 10 digits and start with 0 (e.g. 0559734667)"]);
        exit;
    }

    if (!$address) {
        echo json_encode(["error" => "Address is required"]);
        exit;
    }

    // check if username is taken by another user
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ? AND id != ?");
    $stmt->execute([$username, $_SESSION["user_id"]]);
    if ($stmt->fetch()) {
        echo json_encode(["error" => "Username already taken"]);
        exit;
    }

    if ($newPassword) {
        if (strlen($newPassword) < 4) {
            echo json_encode(["error" => "Password must be at least 4 characters"]);
            exit;
        }
        $stmt = $pdo->prepare("UPDATE users SET username=?, phone=?, address=?, password=? WHERE id=?");
        $stmt->execute([$username, $phone, $address, $newPassword, $_SESSION["user_id"]]);
    } else {
        $stmt = $pdo->prepare("UPDATE users SET username=?, phone=?, address=? WHERE id=?");
        $stmt->execute([$username, $phone, $address, $_SESSION["user_id"]]);
    }

    // update session
    $_SESSION["username"] = $username;
    $_SESSION["phone"]    = $phone;
    $_SESSION["address"]  = $address;

    echo json_encode(["success" => true, "username" => $username, "phone" => $phone, "address" => $address]);
    exit;
}

echo json_encode(["error" => "Unknown action: $action"]);
