# 🛏️ James Cresslawn Luxury Beds

> A full-stack e-commerce platform for a luxury bed and mattress store — built with Java Spring Boot, PostgreSQL, and React.

![Java](https://img.shields.io/badge/Java-17-ED8B00?style=flat-square&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2.3-6DB33F?style=flat-square&logo=springboot&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![PayFast](https://img.shields.io/badge/PayFast-Integrated-00A4E4?style=flat-square)
![JWT](https://img.shields.io/badge/Auth-JWT-black?style=flat-square&logo=jsonwebtokens)
![Docker](https://img.shields.io/badge/Docker-Postgres-2496ED?style=flat-square&logo=docker&logoColor=white)

---

## 📸 Screenshots

### Homepage — Product Listing
<!-- SCREENSHOT: Full homepage showing product grid with filtering -->
![Homepage](https://raw.githubusercontent.com/Nyaungwa/JamesBeds-Full-Stack-eCommerce-App/main/screenshots/homepage.png)

### Product Page
<!-- SCREENSHOT: Single product page with image, price, quantity selector, Add to Cart button -->
![Product Page](https://raw.githubusercontent.com/Nyaungwa/JamesBeds-Full-Stack-eCommerce-App/main/screenshots/productpage.png)

### Shopping Cart
<!-- SCREENSHOT: Cart page showing items, quantity controls +/-, item totals, order summary -->
![Cart](https://raw.githubusercontent.com/Nyaungwa/JamesBeds-Full-Stack-eCommerce-App/main/screenshots/shoppingcartpage.png)

### PayFast Payment
<!-- SCREENSHOT: PayFast sandbox payment page after being redirected from checkout -->
![Payment](https://raw.githubusercontent.com/Nyaungwa/JamesBeds-Full-Stack-eCommerce-App/main/screenshots/paymentpage.png)

### Order Confirmation
<!-- SCREENSHOT: Payment success page or order status showing PAID -->
![Order Confirmation](https://raw.githubusercontent.com/Nyaungwa/JamesBeds-Full-Stack-eCommerce-App/main/screenshots/orderconfirmation.png)

---

## ✨ Features

### Storefront
- Browse luxury beds and mattresses with search and filtering (type, size, comfort level)
- Product pages with pricing, discount badges, and detailed descriptions
- Responsive layout across desktop and mobile

### Authentication
- User registration and login with JWT tokens
- BCrypt password hashing — plain text passwords never stored
- Protected routes — cart and orders require authentication

### Shopping Cart
- Add products to cart (persisted to database per user)
- Increase/decrease quantity or remove items
- Live cart badge count in header
- Duplicate prevention — adding the same product increases quantity

### Orders & Payments
- One-click checkout converts cart to a permanent order
- Product prices **snapshotted at order time** — immune to future price changes
- PayFast payment gateway integration (South African payment processor)
- Server-side ITN (Instant Transaction Notification) webhook — order only marked PAID after PayFast confirms
- Amount verification prevents underpayment attacks

---

## 🏗️ Architecture

```
┌─────────────────────┐         ┌──────────────────────────────────────┐
│   React Frontend    │ ──────▶ │         Spring Boot REST API          │
│   (Vite + Router)   │ ◀────── │         localhost:8080                │
└─────────────────────┘  JSON   └──────────────┬───────────────────────┘
                                               │
                          ┌────────────────────┼────────────────────┐
                          ▼                    ▼                    ▼
                   ┌─────────────┐    ┌──────────────┐    ┌──────────────┐
                   │ PostgreSQL  │    │  PayFast API  │    │   JWT Auth   │
                   │  (Docker)   │    │  (Sandbox)    │    │   Filter     │
                   └─────────────┘    └──────────────┘    └──────────────┘
                                              │
                                     ITN Webhook (ngrok)
                                              │
                                    ┌─────────▼──────────┐
                                    │  /webhooks/payfast  │
                                    │  Validates + marks  │
                                    │  order as PAID      │
                                    └────────────────────┘
```

---

## 🗄️ Database Schema

```
users ──────────────┐
  id (UUID)         │
  email (unique)    │          orders ──────────────────┐
  password_hash     │            id (UUID)               │
  full_name         │            user_id (FK)            │
  role              │            status                  │
                    │            total_amount            │
cart_items          │            shipping_address        │
  id (UUID)         │            tracking_number        │
  user_id (FK) ─────┤                                   │
  product_id (FK)   │          order_items              │
  quantity          │            id (UUID)              │
                    │            order_id (FK) ──────────┘
products            │            product_id (FK)
  id (UUID)         │            product_name  ← snapshot
  name              │            unit_price    ← snapshot
  type              │            quantity
  size              │
  comfort_level     │          payments
  price             │            id (UUID)
  discount_price    │            order_id (FK)
  in_stock          │            provider (PAYFAST)
                    │            provider_reference
                    └────────────status
                                 amount
                                 paid_at
```

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| Java | 17+ | Backend runtime |
| Maven | 3.8+ | Build tool (included via `mvnw`) |
| Node.js | 18+ | Frontend runtime |
| Docker | Latest | PostgreSQL container |
| ngrok | 3.20+ | PayFast webhook tunnel |

---

### 1. Clone the repository

```bash
git clone https://github.com/[your-username]/james-cresslawn.git
cd james-cresslawn
```

---

### 2. Start the database

```bash
docker run --name james-store-db \
  -e POSTGRES_DB=james_store \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=secret \
  -p 5432:5432 \
  -d postgres
```

To start again after a restart:
```bash
docker start james-store-db
```

---

### 3. Configure the backend

Create or update `backend/src/main/resources/application.properties`:

### 3. Configure the backend

Copy the example config and fill in your values:
```bash
cp backend/src/main/resources/application.properties.example \
   backend/src/main/resources/application.properties
```
```properties
# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/james_store
spring.datasource.username=your_db_username
spring.datasource.password=your_db_password

# JWT — must be at least 32 characters
jwt.secret=replace-this-with-a-long-random-string
jwt.expiration=86400000

# PayFast sandbox — get credentials at sandbox.payfast.co.za
payfast.merchant-id=
payfast.merchant-key=
payfast.passphrase=
payfast.sandbox=true

# Update this every time ngrok restarts
payfast.notify-url=https://YOUR_NGROK_URL/webhooks/payfast
payfast.return-url=http://localhost:5173/payment-success
payfast.cancel-url=http://localhost:5173/payment-cancel
```

---

### 4. Run the backend

```bash
cd backend
./mvnw spring-boot:run
```

On first run, Hibernate automatically creates all database tables and seeds 8 luxury products.

Expected output:
```
Started BackendApplication in 9.5 seconds
Products already seeded. Skipping.  (or "Successfully seeded 8 products")
```

---

### 5. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

### 6. Set up ngrok (for PayFast webhook testing)

```bash
ngrok config add-authtoken YOUR_NGROK_TOKEN
ngrok http 8080
```

Copy the `https://` forwarding URL and update `payfast.notify-url` in `application.properties`, then restart the backend.

---

## 📡 API Reference

All protected endpoints require `Authorization: Bearer <token>` header.

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | Public | Register new user |
| `POST` | `/api/auth/login` | Public | Login, returns JWT token |
| `GET` | `/api/auth/me` | Protected | Verify token |

### Products

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/products` | Public | Get all products |
| `GET` | `/api/products/{id}` | Public | Get single product |
| `GET` | `/api/products/search?name=` | Public | Search by name |
| `GET` | `/api/products/filter?type=&size=&comfort=` | Public | Filter products |

### Cart

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/cart` | Protected | Get user's cart |
| `POST` | `/api/cart` | Protected | Add item (or increase qty if exists) |
| `PUT` | `/api/cart/{id}` | Protected | Update item quantity |
| `DELETE` | `/api/cart/{id}` | Protected | Remove item |

### Orders

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/orders` | Protected | Create order from cart |
| `GET` | `/api/orders` | Protected | Get user's order history |
| `GET` | `/api/orders/{id}` | Protected | Get single order |

### Payments

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/payments/payfast/{orderId}` | Protected | Initiate PayFast payment |
| `POST` | `/webhooks/payfast` | Public | PayFast ITN webhook |

---

## 💳 Payment Flow

```
User clicks "Pay Now"
        │
        ▼
POST /api/payments/payfast/{orderId}
  → Backend fetches order
  → Builds PayFast params
  → Generates MD5 signature
  → Returns { paymentUrl, params }
        │
        ▼
Frontend redirects to PayFast sandbox
  → User completes payment
        │
        ▼
PayFast sends ITN to /webhooks/payfast (via ngrok)
  → Backend receives POST with payment data
  → Validates payment_status = COMPLETE
  → Verifies amount_gross matches order total
  → Updates order status → PAID
  → Saves Payment record
        │
        ▼
PayFast redirects user to /payment-success
```

> **Security note:** Orders are never marked as PAID from the frontend. Only a verified PayFast ITN webhook can change order status — preventing any client-side payment bypass.

---

## 📁 Project Structure

```
james-cresslawn/
├── backend/
│   └── src/main/java/jamescresslawn/
│       ├── auth/           # JWT auth (register, login)
│       ├── cart/           # Cart endpoints + service
│       ├── config/         # Security, CORS, DataSeeder
│       ├── entity/         # JPA entities (User, Product, Order...)
│       ├── jwt/            # JWT utility + filter
│       ├── order/          # Order creation + retrieval
│       ├── payment/        # PayFast integration + webhook
│       └── repository/     # Spring Data JPA repositories
│
└── frontend/
    └── src/
        ├── api/            # cartApi.js — all HTTP calls
        ├── context/        # CartContext — global cart state
        └── pages/          # Homepage, Productpage, CartPage...
```

---

## 🔧 Tech Stack

### Backend
- **Java 17** + **Spring Boot 3.2**
- **Spring Security** — JWT authentication, BCrypt hashing
- **Spring Data JPA** + **Hibernate** — ORM, auto table creation
- **PostgreSQL** — relational database (Docker)
- **PayFast** — South African payment gateway

### Frontend
- **React 18** + **Vite**
- **React Router** — client-side routing
- **Context API** — global cart state
- **Fetch API** — HTTP requests to backend

### Infrastructure
- **Docker** — PostgreSQL container
- **ngrok** — local webhook tunnel for PayFast ITN testing
- **Maven** — Java build tool

---

## 📌 Project Status

| Phase | Feature | Status |
|-------|---------|--------|
| Phase 1 | Database + entities + product API | ✅ Complete |
| Phase 2 | JWT authentication | ✅ Complete |
| Phase 3 | Shopping cart | ✅ Complete |
| Phase 4 | Order creation | ✅ Complete |
| Phase 5 | PayFast payment | ✅ Complete |

---

## 👤 Author

**Edwin Nyaungwa**
BSc Computer Science Honours — University of Pretoria, 2026


## 🖼️ Image Credits

Background images sourced from [Freepik](https://www.freepik.com).
<a href="https://www.freepik.com">Image by Freepik</a>

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=flat-square&logo=linkedin)](https://www.linkedin.com/in/edwin-nyaungwa-4696a12b5/)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-181717?style=flat-square&logo=github)](https://github.com/Nyaungwa)
[![Email](https://img.shields.io/badge/Email-Contact-EA4335?style=flat-square&logo=gmail)](mailto:edwinnyaungwa02@gmail.com)

---

## 📄 License

This project is for educational and portfolio purposes.
