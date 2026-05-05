<?php
// run this file once to set up the database
// after running it you can delete it or just leave it

$host = "localhost";
$user = "root";
$pass = "root";

try {
    $pdo = new PDO("mysql:host=$host;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $pdo->exec("CREATE DATABASE IF NOT EXISTS opal_store CHARACTER SET utf8 COLLATE utf8_general_ci");
    $pdo->exec("USE opal_store");

    // users table - password stored as plain text
    $pdo->exec("CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        is_admin TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    // products table - image can be a url or a filename saved in the uploads folder
    // stock column limits how many units can be purchased
    $pdo->exec("CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        category VARCHAR(100),
        description TEXT,
        image VARCHAR(500),
        stock INT DEFAULT 10,
        customizable TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    // cart table - tied to session so guests can use it too
    $pdo->exec("CREATE TABLE IF NOT EXISTS cart (
        id INT AUTO_INCREMENT PRIMARY KEY,
        session_id VARCHAR(100) NOT NULL,
        cart_key VARCHAR(200) NOT NULL,
        product_id VARCHAR(50) NOT NULL,
        quantity INT DEFAULT 1,
        variant_data TEXT,
        size VARCHAR(50),
        UNIQUE KEY unique_cart_item (session_id, cart_key)
    )");

    // plain text passwords as requested
    $stmt = $pdo->prepare("INSERT IGNORE INTO users (username, password, is_admin) VALUES (?, ?, ?)");
    $stmt->execute(["admin", "admin123", 1]);
    $stmt->execute(["user1", "user123", 0]);

    // seed products with stock values
    $products = [
     
        ["p1", "Summit Series Alpha Backpack", 249.99, "Bags",
         "Ultra-durable, weather-resistant 45L backpack for extended backcountry missions. Features adjustable suspension, multiple attachment points, and hydration sleeve.",
         "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", 15, 0],
        ["p3", "Merino Wool Base Layer Top", 85.00, "Apparel",
         "Temperature-regulating, odor-resistant 100% merino wool. The perfect foundation for any cold-weather layering system.",
         "https://images.unsplash.com/photo-1618354691438-25bc04584c23?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", 20, 0],
        ["p4", "Titanium Camp Stove", 54.50, "Cooking",
         "Micro-sized, high-output stove that boils a liter of water in under 3 minutes. Folds down to fit inside your mug.",
         "https://images.unsplash.com/photo-1606228303038-f80e7d0bbd60?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", 12, 0],
        ["p5", "Alpine Ascend Hiking Boots", 189.95, "Footwear",
         "Waterproof, breathable Gore-Tex lined boots with Vibram soles for unmatched traction on wet and rocky terrain.",
         "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", 7, 0],
        ["p6", "Down Sleeping Bag (15F)", 289.00, "Sleeping",
         "800-fill water-resistant down provides exceptional warmth without the weight. Mummy shape maximizes thermal efficiency.",
         "https://images.unsplash.com/photo-1559810852-25927c3a05f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", 6, 0],
    ];

    $stmt = $pdo->prepare("INSERT IGNORE INTO products (id, name, price, category, description, image, stock, customizable) VALUES (?, ?, ?, ?, ?,?,?,?)");
    foreach ($products as $p) {
        $stmt->execute($p);
    }

    // make the uploads folder so we can save product images there
    $uploadDir = __DIR__ . "/uploads";
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
        echo "Created uploads/ folder.<br>";
    }

    echo "Database setup done!<br>";
    echo "Admin: admin / admin123<br>";
    echo "User: user1 / user123";

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
