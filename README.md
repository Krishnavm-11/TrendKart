# 🛍️ TrendKart --- MERN Stack E-Commerce Website

TrendKart is a full-stack e-commerce web application built with the
**MERN stack**. It provides an online shopping experience with user
authentication, product discovery, cart management, checkout, payment
options, order tracking, and an admin dashboard.

This project demonstrates practical full-stack development concepts,
including frontend development, backend APIs, database integration,
authentication, image uploads, and deployment.

## 🚀 Live Demo

**Frontend:** https://trend-kart-ten.vercel.app

------------------------------------------------------------------------

## ✨ Features

### 👤 Customer Features

-   Register and log in
-   Browse products and view product details
-   Search products and browse by category
-   Add products to the cart
-   Update quantities and remove cart items
-   Enter shipping and delivery details
-   Choose an available payment method
-   Place orders
-   View order history and order status
-   Use a responsive shopping interface

### 🔐 Admin Features

-   Secure admin login and protected dashboard
-   Add, edit, and delete products
-   Manage product stock
-   Upload product images
-   Add and delete promotional banners
-   View customer orders and order details
-   View customer information associated with orders
-   Update order status
-   Delete orders, if enabled in the current backend

### ⚙️ Backend Features

-   REST API architecture
-   JWT-based authentication
-   Protected routes and admin authorization
-   Password hashing with bcryptjs
-   MongoDB database integration with Mongoose
-   Cloudinary image storage
-   API error handling

## 🛠️ Technology Stack

  Area                      Technologies
  ------------------------- -----------------------------------------------
  Frontend                  React, Vite, JavaScript
  Styling                   Tailwind CSS
  State management          Redux Toolkit
  Routing                   React Router
  HTTP requests             Axios
  Icons                     Lucide React
  Backend                   Node.js, Express.js
  Database                  MongoDB, MongoDB Atlas, Mongoose
  Authentication            JWT, bcryptjs
  Image uploads             Cloudinary, Multer, multer-storage-cloudinary
  Development and testing   Git, GitHub, Postman
  Deployment                Vercel, Render

## 📂 Project Structure

``` text
TrendKart/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── redux/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   ├── server.js
│   └── package.json
└── README.md
```

## 🔑 Authentication

TrendKart uses JWT-based authentication to support customer accounts and
protected functionality.

### Customer Authentication

1.  Create an account.
2.  Log in with email and password.
3.  Receive an authentication token.
4.  Access protected features.
5.  Place orders and view order history.

### Admin Authentication

Administrators use the admin login flow to access protected dashboard
features, such as product, banner, and order management. Admin-only API
routes should verify authorization on the server.

## 🛒 Shopping Workflow

``` text
Register / Login
       ↓
Browse Products
       ↓
View Product Details
       ↓
Add to Cart
       ↓
Checkout
       ↓
Enter Shipping Details
       ↓
Choose Payment Method
       ↓
Place Order
       ↓
View Order History
```

## 📦 Order Management

Checkout details may include: - Full name - Phone number - Email -
Delivery address - City and state - PIN code - Payment method

The admin dashboard supports viewing customer orders and updating their
status. The documented order statuses are:

-   Pending
-   Confirmed
-   Shipped
-   Delivered
-   Cancelled
-   Declined

Available status values depend on the backend implementation.

## 🗄️ Database

TrendKart uses **MongoDB Atlas** for hosted database storage and
**Mongoose** for schema modeling.

Main collections described for the application: - Users - Products -
Orders - Banners

Orders are associated with authenticated users so customers can view
their own order history.

## 🖼️ Image Uploads

Product and banner images use **Cloudinary** for remote storage. The
backend uses Multer and `multer-storage-cloudinary` to process uploads,
avoiding dependence on local server storage for hosted images.

## 🔌 API Endpoints

The following endpoints are based on the routes documented for this
project. Confirm the exact paths and HTTP methods in the current backend
before relying on them.

### Authentication

``` http
POST /api/auth/register
POST /api/auth/login
```

### Products

``` http
GET    /api/products
GET    /api/products/:id
POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id
```

### Orders

``` http
POST   /api/orders
GET    /api/orders/my-orders
GET    /api/orders
PUT    /api/orders/:id/status
DELETE /api/orders/:id
```

## 💳 Payment Options

The project description lists **Cash on Delivery** and a **card payment
option**. The card option may be a UI/demo flow unless a payment gateway
is configured and verified in the backend. Do not use real payment
details in a demo checkout.

## 🔒 Security

Security measures described for TrendKart include: - JWT
authentication - Protected API routes - Admin authorization - Password
hashing with bcryptjs - Token-based API authorization - Environment
variables for sensitive configuration - Role-based access control

Never expose private keys or database credentials in frontend code or
commit them to a public repository.

## 📱 Responsive Design

The interface is designed for desktop, laptop, tablet, and mobile screen
sizes, using Tailwind CSS for responsive styling.

## ⚙️ Installation and Setup

### Prerequisites

-   Node.js and npm
-   A MongoDB Atlas account or local MongoDB instance
-   A Cloudinary account for image uploads
-   Git

### 1. Clone the repository

Replace the placeholder with the actual GitHub repository URL:

``` bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd TrendKart
```

### 2. Install backend dependencies

``` bash
cd server
npm install
```

### 3. Install frontend dependencies

Open another terminal in the project directory:

``` bash
cd client
npm install
```

## ▶️ Run Locally

### Start the backend

From the `server` folder, run the script configured in
`server/package.json`. If a `dev` script exists:

``` bash
npm run dev
```

The backend is expected to use port `5000` in the example local setup.

### Start the frontend

From the `client` folder, run:

``` bash
npm run dev
```

Vite usually serves the frontend at:

``` text
http://localhost:5173
```

Make sure the frontend API configuration points to the backend URL. The
project uses `client/src/services/api.js` for API configuration
according to the supplied project description.

## 🔐 Environment Variables

Create a `.env` file inside the `server` directory:

``` env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Use the variable names expected by your backend code. If your deployment
uses a different port or environment-variable name, update this example
to match.

> **Security note:** Never commit `.env` files, database credentials,
> JWT secrets, or Cloudinary API secrets to GitHub. Configure production
> secrets in Render's environment settings.

## 🧪 API Testing

Use **Postman** to test backend endpoints. For protected routes, include
the token in the request header when required:

``` http
Authorization: Bearer YOUR_TOKEN
```

## 🚀 Deployment

-   **Frontend:** Vercel --- https://trend-kart-ten.vercel.app
-   **Backend:** Render
-   **Database:** MongoDB Atlas
-   **Image storage:** Cloudinary

The frontend must be configured to call the deployed backend URL, and
the backend must allow requests from the deployed frontend through its
CORS configuration.

## 📌 Possible Future Improvements

-   Wishlist functionality
-   Product reviews and ratings
-   Coupon and discount system
-   Pagination
-   Advanced product filtering and sorting
-   Email order notifications
-   Production-ready payment gateway integration
-   User profile management
-   Sales analytics
-   Product recommendations
-   Additional admin dashboard insights

## 🎯 Learning Outcomes

This project covers practical concepts including: - MERN stack
application development - React components and routing - Redux Toolkit
state management - REST API development and integration - MongoDB and
Mongoose - JWT authentication and role-based authorization - Password
hashing - Cloudinary image uploads - Order and product management - API
testing with Postman - Git and GitHub workflows - Deployment with Vercel
and Render - Responsive UI development

## 👩‍💻 Author

**Krishna**\
*MERN Stack Developer*

------------------------------------------------------------------------

TrendKart is a full-stack project built to practise and demonstrate
practical web development skills using the MERN stack.
