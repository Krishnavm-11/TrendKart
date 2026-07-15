# FashionStore E-Commerce Project

FashionStore is a full-stack e-commerce web application built with React, Redux, Tailwind CSS, Node.js, Express, MongoDB, Cloudinary, and JWT authentication.

The project includes a user shopping flow, product browsing by category, search, cart, checkout, order history, and an admin dashboard for managing products, banners, and orders.

## Features

### User Features

- User registration and login
- Browse latest products
- Search products by name, brand, category, or description
- Shop by category:
  - Men
  - Women
  - Kids
  - Footwear
  - Accessories
- View product details
- Add products to cart
- Checkout with:
  - Card payment
  - Cash on delivery
- View order history
- See order status:
  - Pending
  - Confirmed
  - Declined
- User logout

### Admin Features

- Admin login
- Admin dashboard without user navbar
- Add products
- Edit products
- Update products
- Delete products
- Upload product images using Cloudinary
- Add and delete homepage banners
- View all orders
- Update order status:
  - Pending
  - Confirmed
  - Declined

### Homepage Features

- Responsive navbar
- Search bar
- Cart count
- Login/logout option
- Auto-changing banner slider
- Manual next/previous banner buttons
- Shop by category section
- Featured products section

## Tech Stack

### Frontend

- React
- React Router DOM
- Redux Toolkit
- React Redux
- Axios
- Tailwind CSS
- Vite

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- Multer
- Cloudinary
- CORS
- dotenv

## Folder Structure

```txt
ecommerce_project
├── client
│   ├── src
│   │   ├── components
│   │   │   ├── Navbar.jsx
│   │   │   └── ProductCard.jsx
│   │   ├── pages
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── ProductDetails.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── BuyNow.jsx
│   │   │   ├── Payment.jsx
│   │   │   ├── PaymentSuccess.jsx
│   │   │   ├── OrderHistory.jsx
│   │   │   ├── CategoryPage.jsx
│   │   │   ├── SearchResults.jsx
│   │   │   ├── AdminLogin.jsx
│   │   │   └── AdminDashboard.jsx
│   │   ├── redux
│   │   │   ├── cartSlice.js
│   │   │   ├── productSlice.js
│   │   │   └── store.js
│   │   ├── services
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
└── server
    ├── config
    │   ├── db.js
    │   └── cloudinary.js
    ├── controllers
    │   ├── authController.js
    │   ├── productController.js
    │   ├── bannerController.js
    │   └── orderController.js
    ├── middleware
    │   ├── authMiddleware.js
    │   └── upload.js
    ├── models
    │   ├── User.js
    │   ├── Product.js
    │   ├── Banner.js
    │   └── Order.js
    ├── routes
    │   ├── authRoutes.js
    │   ├── productRoutes.js
    │   ├── bannerRoutes.js
    │   └── orderRoutes.js
    ├── server.js
    └── package.json
```

## Installation

Clone the project and install dependencies in both frontend and backend folders.

### Backend Setup

```bash
cd server
npm install
```

Create a `.env` file inside the `server` folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Start the backend:

```bash
npm run dev
```

or:

```bash
node server.js
```

Backend runs on:

```txt
http://localhost:5000
```

### Frontend Setup

```bash
cd client
npm install
npm run dev
```

Frontend runs on:

```txt
http://localhost:5173
```

## API Configuration

In `client/src/services/api.js`:

```js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

export default API;
```

## API Routes

### Auth Routes

```txt
POST /api/auth/register
POST /api/auth/login
```

### Product Routes

```txt
GET    /api/products
GET    /api/products/:id
POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id
```

Admin token is required for create, update, and delete product routes.

### Banner Routes

```txt
GET    /api/banners
POST   /api/banners
PUT    /api/banners/:id
DELETE /api/banners/:id
```

Admin token is required for create, update, and delete banner routes.

### Order Routes

```txt
POST /api/orders
GET  /api/orders/my-orders
GET  /api/orders
PUT  /api/orders/:id/status
```

User token is required for creating and viewing personal orders.

Admin token is required for viewing all orders and updating order status.

## Admin Access

Register a normal user first, then update the user's role in MongoDB:

```js
role: "admin"
```

Then login from:

```txt
http://localhost:5173/admin/login
```

Admin dashboard:

```txt
http://localhost:5173/admin/dashboard
```

## Order Status Colors

Order statuses are shown with different colors:

```txt
Pending   - Yellow
Confirmed - Green
Declined  - Red
```

## Testing With Postman

### Login

```txt
POST http://localhost:5000/api/auth/login
```

Body:

```json
{
  "email": "admin@gmail.com",
  "password": "admin123"
}
```

Copy the returned token and use it as a Bearer Token for protected routes.

### Add Product

```txt
POST http://localhost:5000/api/products
```

Use `form-data`:

```txt
name
brand
description
price
category
stock
image
```

### Add Banner

```txt
POST http://localhost:5000/api/banners
```

Use `form-data`:

```txt
title
subtitle
image
```

### Update Order Status

```txt
PUT http://localhost:5000/api/orders/:id/status
```

Body:

```json
{
  "status": "Confirmed"
}
```

Valid status values:

```txt
Pending
Confirmed
Declined
```

## Notes

- Make sure the backend is running before starting the frontend.
- Make sure MongoDB is connected correctly.
- Make sure Cloudinary credentials are correct before uploading images.
- Product category values should match frontend category routes:
  - `men`
  - `women`
  - `kids`
  - `footwear`
  - `accessories`
- Normal user token is saved as `token` in `localStorage`.
- Admin token is saved as `adminToken` in `localStorage`.

## Future Improvements

- Add real payment gateway integration
- Add user profile page
- Add order cancellation
- Add product reviews and ratings
- Add pagination
- Add wishlist
- Add advanced product filters
- Add admin sales analytics
