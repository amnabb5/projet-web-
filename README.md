# projet-web-
# ◈ OPAL — Premium Adventure Gear & Customizable Footwear Store

OPAL is a high-performance, responsive **Single Page Application (SPA)** e-commerce store designed for premium outdoor adventure gear and highly customizable apparel/footwear. Built with a robust **vanilla JavaScript** client-side router, a sleek custom **CSS design system**, and a dynamic **PHP/MySQL REST API**, OPAL represents a complete, professional production environment for modern e-commerce.

---

## 🚀 Key Features

### 1. Modern Single Page Application (SPA)
*   **Vanilla Client-Side Router:** Custom hash-based router (`#/`, `#/shop`, `#/product/:id`, `#/cart`, `#/login`, `#/register`, `#/admin`, `#/profile`) with dynamic transitions, state restoration, and transparent navbar handling on hero sections.
*   **Active Client-State:** Lightweight global state machine syncing seamlessly with REST endpoints in the background.
*   **Optimistic UI Updates:** Instant additions, quantity modifications, and deletions in the cart, automatically rolling back to previous state if API communication encounters network errors.

### 2. High-Fidelity Custom Shoe Customizer
*   **Dynamic Visual Rendering:** Allows buyers of customizable products (e.g., *Nike ReactX Rejuven8* or *Nike G.T. Cut 3 Turbo*) to select dynamic, premium colorways (swatches with hex codes, custom naming, and variant-specific product images).
*   **Size Variant Distribution:** Select shoe sizes ranging from **US 7 to US 12** with individual colorway associations.
*   **Interactive Custom Canvas:** Immediate visual swaps on the main product detail panel as swatches or sizing controls are clicked.

### 3. Granular Variant Stock Tracking & Validation
*   **True Variant-Level Stocking:** Products have either global stock levels (for simple items like backpacks and apparel) or color/size variant-level stock (for custom shoes).
*   **Multi-Phase Validation:** Real-time stock validation triggers at three critical gates:
    1.  *Product Detail View:* Add-to-cart buttons dynamically display "Sold Out", "Only X left", or "In Stock" depending on the active variant combination.
    2.  *Client Cart Updates:* Dynamic limit checks prevent users from adjusting quantities beyond maximum variant stock levels.
    3.  *Server-Side Checkout Validation:* Prevents over-purchasing and race conditions by doing locked database validation against variant tables before final order insertion.
*   **Automatic Stock Depletion:** Decrements the appropriate variant or product stock level directly on successful orders.

### 4. Comprehensive Admin Dashboard
*   **Products CRUD:** Manage the entire store inventory. Add, modify, or delete items.
*   **Custom Variant Panel:** Seamlessly add dynamic colorways, configure custom HEX values, link unique file/URL images, and define size-by-size inventory counts.
*   **Image File Uploading:** Direct binary file uploading via the admin panel (restricted to 5MB, validates JPEG/PNG/WebP/GIF) or direct external image URLs.
*   **Upgraded Order Management:**
    *   Unified grid displaying chronological customer orders.
    *   Joins the orders database with customer profiles to fetch up-to-date delivery details (`username`, `phone`, `address`).
    *   Detailed item summaries displaying purchased variant info (e.g., `Lavender / US 9`) and snapshot prices to maintain transaction history integrity.
    *   Dynamic order fulfillment transition: mark pending orders as "Done" with a single click.

### 5. Unified User Authentication & Personalization
*   **Robust Access Control:** Password validation and role-based permissions (`is_admin` vs. general users).
*   **Personal Profile Management:** Custom credentials update form allowing users to change their username, password, phone, and delivery address.
*   **Algerian Phone Formatting:** Structured input validation enforcing strict 10-digit Algerian formatting (starting with `0`, e.g., `0559734667`).

---

## 🛠️ Technology Stack

*   **Frontend Core:** Vanilla HTML5, Semantic Structure, custom HSL Color Variables, Flexbox/Grid CSS layouts, CSS-driven keyframe micro-animations, and Lucide CDNs.
*   **Routing & Logic:** JavaScript (ES6+), Client Router, `fetch` async wrapper, dynamic state engine, Toast notifications, and optimistic state managers.
*   **Backend REST API:** PHP 7.4+ (structured controllers, session managers, file upload stream processing).
*   **Database Integration:** MySQL (relational structure, PDO connections, multi-table JOINs, foreign key cascades, and unique constraints).

---

## 📊 Database Schema Architecture

OPAL utilizes an efficient MySQL schema to store product details, dynamic variant configurations, temporary session carts, and order details. Below is the relational structure:

```mermaid
erDiagram
    users ||--o{ orders : "places"
    products ||--o{ product_variants : "has"
    products ||--o{ cart : "contains"
    products ||--o{ order_items : "referenced-in"
    orders ||--|{ order_items : "contains"
    
    users {
        int id PK
        string username UNIQUE
        string password
        string phone
        string address
        boolean is_admin
        timestamp created_at
    }
    products {
        string id PK
        string name
        decimal price
        string category
        text description
        string image
        int stock
        boolean customizable
        timestamp created_at
    }
    product_variants {
        int id PK
        string product_id FK
        string color_id
        string color_name
        string color_code
        string size
        string image
        int stock
    }
    cart {
        int id PK
        string session_id
        string cart_key UNIQUE
        string product_id FK
        int quantity
        text variant_data
        string size
    }
    orders {
        int id PK
        int user_id FK
        decimal total
        string status
        timestamp created_at
    }
    order_items {
        int id PK
        int order_id FK
        string product_id FK
        string product_name
        decimal price
        int quantity
        string variant_info
    }
```

> **Data Integrity:** In `order_items`, the `product_name` and `price` fields are captured as static snapshots during checkout. This guarantees that historic orders remain accurate even if products are later deleted or prices are modified.

---

## 📂 File Directory Overview

```bash
c:/xampp/htdocs/shop/
├── index.html        # Main Application SPA template & navigation markup
├── style.css         # Comprehensive Custom CSS, responsive layouts, variables & animations
├── app.js            # Frontend logic, custom router, state machine & dynamic view renders
├── api.php           # Unified REST API endpoint (Handles products, auth, cart, orders & uploads)
├── db.php            # PDO Database connector config
├── init_db.php       # Database migrations and sample data seeding script
├── uploads/          # Destination folder for Admin product image uploads
├── shoe1/            # High-resolution assets for customizable shoe 1
├── shoe2/            # High-resolution assets for customizable shoe 2
└── README.md         # Professional technical documentation (this file)
```

---

## ⚙️ Installation & Setup

Follow these simple steps to host the OPAL adventure gear store locally using **XAMPP**:

### Step 1: Clone or Copy files
Place the files into your XAMPP web server root directory:
```bash
C:\xampp\htdocs\shop\
```

### Step 2: Create a Local Database
1.  Open your browser and head to **phpMyAdmin**: `http://localhost/phpmyadmin/`
2.  Click **New** on the sidebar, name the database `opal_store`, and set collation to `utf8mb4_general_ci`.
3.  Click **Create**.

### Step 3: Run Database Migrations & Seeders
Open your browser and navigate to the initialization script:
```url
http://localhost/shop/init_db.php
```
This script will drop any conflicting remnants, construct the necessary tables, verify your constraints, and seed the store with high-quality backpack, apparel, camping stove, and customizable shoe items.
> **Success Confirmation:** You will see a success message: `Database initialized successfully with variants and seeded customizable products!`

### Step 4: Access the Store
You can now navigate to your local workspace:
```url
http://localhost/shop/
```

---

## 🔐 Default Testing Credentials

The seeder initializes two core user types. You can use these to test the complete application flow:

| Role | Username | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Store Administrator** | `admin` | `admin123` | Full dashboard, add/edit/delete products, configure variant stock levels, fulfill customer orders. |
| **Standard Customer** | `user1` | `user123` | Complete shopping, view dynamic stocks, customize items, manage profile, complete checkout. |

---

## 🧭 Application Walkthrough

### 🏕️ Storefront Landing Page
Enjoy a curated, glassmorphic layout highlighting hero banners, dynamic scroll-reveal visual grids, a categorical breakdown panel, and a modern rolling text ticker.

### 🛍️ Unified Shop & Filters
*   **Search Engine:** Instantaneous, real-time item title matches.
*   **Pill Categories:** Instantly filter backpacks, apparel, base layers, footwear, and cooking gear.
*   **Price Sorter & Ranges:** Filter minimum and maximum budgets or sort prices in ascending/descending order.

### 🎨 Shoe Customizer (Product Detail Page)
*   **Dynamic Visuals:** Select from preset color palettes. Each color immediately loads a matching product image.
*   **Interactive Sizing:** Tap to change sizing values.
*   **Live Stock Indicator:** Automatically queries variant arrays and shows real-time items remaining (e.g. `Only 3 left in stock!`, `In Stock`, `Out of Stock`).

### 🛒 Slide-Out Shopping Cart Drawer
*   Access your bag from any page without losing your active layout.
*   Increase/decrease quantities optimistically, with real-time stock-ceiling constraints.
*   Frictionless guest-cart session memory, persisting products across reloads until authentication is initiated.

### 👤 Profile Center
*   Personalized information console to update addresses, phones, and passwords.
*   Real-time validation for Algerian layout rules.

### 🛡️ Secure Admin Control Center
*   **Tab 1: Product Management:** Add products easily. If the `Customizable Shoe` checkbox is checked, the variant builder is revealed, letting you define custom colors, images, and sizes.
*   **Tab 2: Orders Panel:** Track incoming transactions. Review customer contact info, billing totals, order dates, and exact variant descriptions. Fulfill order steps by transforming orders from `pending` to `done` with automated state updates.

---

*Enjoy exploring the outdoors with OPAL! If you have any database connection issues, check that the host, name, username, and password credentials in [db.php](file:///c:/xampp/htdocs/shop/db.php) match your MySQL configurations.*
