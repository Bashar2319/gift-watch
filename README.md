# CHRONO — Watch E-Commerce Platform

A complete, responsive, full-stack watch e-commerce website with direct WhatsApp ordering. Built using the MERN Stack (MongoDB, Express, React, Node.js) with Tailwind CSS, JWT authentication, and Cloudinary image hosting.

---

## 🕐 Tech Stack Summary
- **Frontend:** React (Vite) + Tailwind CSS + Lucide Icons + react-hot-toast
- **Backend:** Node.js + Express.js
- **Database:** MongoDB Atlas (Mongoose ODM)
- **Auth:** JSON Web Tokens (JWT) + bcryptjs
- **Images:** Cloudinary (via Multer storage)
- **Checkout:** WhatsApp Direct Redirect (Pre-filled message linking details)

---

## 📁 Project Structure

```
watch-store/
├── client/                 # React Frontend (Vite)
│   ├── src/
│   │   ├── components/     # Navbar, Footer, ProtectedRoute, ProductCard/Skeleton
│   │   ├── context/        # AuthContext, CartContext (State Management)
│   │   ├── pages/          # Home, Shop, ProductDetails, Cart, Checkout, Auth, Dashboards
│   │   ├── services/       # api.js (Axios Instance with Interceptors)
│   │   ├── App.jsx         # Routes Configuration
│   │   ├── main.jsx        # Mounting entry point
│   │   └── index.css       # Tailwind Directives & Shimmer CSS
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── index.html
│   └── .env.example
│
├── server/                 # Express Backend API
│   ├── config/             # db.js (MongoDB), cloudinary.js (Multer Storage)
│   ├── controllers/        # auth, product, order, user controllers
│   ├── middleware/         # authMiddleware (JWT check), errorMiddleware (404/500 handler)
│   ├── models/             # User, Product, Order schemas
│   ├── routes/             # authRoutes, productRoutes, orderRoutes, userRoutes
│   ├── server.js           # API Server entry point
│   └── .env.example
└── README.md               # Setup Guide
```

---

## 🛠️ Step-by-Step Installation

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (v16+ recommended) and a running [MongoDB](https://www.mongodb.com/cloud/atlas) cluster.

---

### Step 1: Clone or Open the Project
Open a terminal in the root directory: `watch-store/`.

### Step 2: Configure the Backend Environment
1. Go to the `server/` directory:
   ```bash
   cd server
   ```
2. Create a `.env` file by copying the template:
   ```bash
   copy .env.example .env
   ```
3. Open `.env` and fill in your actual credentials:
   - `MONGO_URI`: Your MongoDB connection string.
   - `JWT_SECRET`: Any random security string (e.g. `mysecurekey123`).
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: Credentials from your Cloudinary dashboard.
   - `WHATSAPP_NUMBER`: The business number where orders should be redirected (e.g. `919876543210` - country code first, no `+` or spaces).
   - `CLIENT_URL`: `http://localhost:5173` (for local development).

### Step 3: Run the Backend Server
1. Install backend dependencies:
   ```bash
   npm install
   ```
2. Start the API server in development mode (with hot reloading):
   ```bash
   npm run dev
   ```
   The server should connect to MongoDB and start running on port `5000`.

---

### Step 4: Configure the Frontend Environment
1. Open a new terminal and go to the `client/` directory:
   ```bash
   cd client
   ```
2. Create a `.env` file:
   ```bash
   copy .env.example .env
   ```
3. Open `.env` and fill in the values:
   - `VITE_API_BASE_URL`: `http://localhost:5000/api`
   - `VITE_WHATSAPP_NUMBER`: Your business WhatsApp number (matching the server config, e.g. `919876543210`).

### Step 5: Start the Frontend Application
1. Install frontend dependencies:
   ```bash
   npm install
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

## ⚡ Key Workflows to Test

### 1. Seed Initial Products (via Admin Panel)
1. Go to `http://localhost:5173/register` and create an account.
2. By default, new accounts are created as `customer` role. To make yourself an admin to upload products:
   - Open your MongoDB Database tool (Compass or Atlas UI).
   - Locate the `users` collection.
   - Find your user document and edit the `role` field from `"customer"` to `"admin"`.
3. Reload the browser and you'll see the **Admin Panel** link in the navigation bar!
4. Go to the Admin Panel, click the **Products** tab, and add a few watches with brand names, descriptions, pricing, stock levels, and upload images. The images will automatically be saved to Cloudinary.

### 2. Purchase Flow (Customer)
1. Go to the **Shop** page, search for products, apply filters, and click **Add to Cart**.
2. Go to the **Cart** page, inspect order totals, and click **Checkout**.
3. Fill in your delivery address, add notes, and click **Order via WhatsApp**.
4. The backend will save the order status as `pending` in the database, and you will be redirected to WhatsApp Web / App with a pre-filled chat details message for the seller number.
5. In the **Admin Dashboard**, click **Orders** to see the order. You can mark it as **Paid** (which adds to revenue stats) and update the fulfillment status as you ship it!

---

## 🚀 Deployment Recommendations

### Backend (Node/Express API)
- Deploy to platforms like **Render**, **Heroku**, or **DigitalOcean**.
- Set all `.env` keys in the host dashboard Environment Variables.

### Frontend (React SPA)
- Deploy to **Vercel**, **Netlify**, or **GitHub Pages**.
- Configure `VITE_API_BASE_URL` to point to your deployed backend URL.
