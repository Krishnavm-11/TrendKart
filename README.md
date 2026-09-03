# 🛍️ TrendKart — MERN Stack E-Commerce Website

TrendKart is a full-stack e-commerce web application built using the **MERN stack**. It provides a complete online shopping experience with user authentication, product browsing, cart management, checkout, payment options, order tracking, and an admin dashboard.

The project was developed to practice and demonstrate real-world **frontend, backend, database, authentication, API integration, file upload, and deployment** concepts.

---

## 🚀 Live Demo

**Frontend:** https://trend-kart-ten.vercel.app [TrendKart Live Demo]

---

## ✨ Features

### 👤 User Features

* User registration and login
* Browse products
* Product search
* Browse products by category
* Product details
* Add products to cart
* Update cart quantity
* Remove products from cart
* Checkout
* Shipping details
* Cash on Delivery
* Card payment option
* Place orders
* View order history
* View order status
* Responsive design

### 🔐 Admin Features

* Secure admin login
* Admin dashboard
* Add products
* Edit products
* Delete products
* Manage product stock
* Upload product images
* Add promotional banners
* Delete banners
* View customer orders
* View customer details
* Update order status

### ⚙️ Backend Features

* RESTful API architecture
* JWT authentication
* Protected routes
* Admin authorization
* Password hashing using bcrypt
* MongoDB database
* Mongoose models
* Cloudinary image storage
* Error handling

---

## 🛠️ Tech Stack

### Frontend

* React.js
* Vite
* Tailwind CSS
* Redux Toolkit
* React Router
* Axios
* Lucide React

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* bcryptjs

### Services & Tools

* Cloudinary
* Git
* GitHub
* Postman
* Vercel
* Render

---

## 📂 Project Structure

```text
TrendKart/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── redux/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   └── package.json
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

## 🔑 Authentication

TrendKart uses **JWT-based authentication** for secure user and admin access.

### User Authentication

Users can:

1. Create an account
2. Login with email and password
3. Receive a JWT authentication token
4. Access protected features
5. Place orders
6. View their order history

### Admin Authentication

Administrators have a separate login flow and can access the protected admin dashboard.

Admin permissions include:

* Product management
* Banner management
* Order management
* Order status updates

---

## 🛒 Shopping Flow

```text
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

---

## 👨‍💼 Admin Flow

```text
Admin Login
     ↓
Admin Dashboard
     ↓
┌───────────────┐
│   Products    │
│   Banners     │
│    Orders     │
└───────────────┘
```

---

## 📦 Order Management

Customers can place orders with:

* Full name
* Phone number
* Email
* Delivery address
* City
* State
* PIN code
* Payment method

Administrators can:

* View customer orders
* View customer details
* View order items
* Update order status
* Delete orders

### Order Status

The application supports different order statuses such as:

* Pending
* Confirmed
* Shipped
* Delivered
* Cancelled
* Declined

---

## 🗄️ Database

TrendKart uses **MongoDB Atlas** as the database with **Mongoose** for data modeling.

### Main Collections

* Users
* Products
* Orders
* Banners

Orders are associated with authenticated users, allowing customers to view their own order history.

---

## 🖼️ Image Upload

Product and banner images are uploaded and stored using **Cloudinary**.

The backend uses:

* Multer
* Cloudinary
* Multer Storage Cloudinary

This allows images to be stored remotely rather than relying on local server storage.

---

## 🔌 API Endpoints

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
```

### Products

```text
GET    /api/products
GET    /api/products/:id
POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id
```

### Orders

```text
POST   /api/orders
GET    /api/orders/my-orders
GET    /api/orders
PUT    /api/orders/:id/status
DELETE /api/orders/:id
```

### Banners

```text
GET    /api/banners
POST   /api/banners
DELETE /api/banners/:id
```

---

## 💳 Payment

The checkout system supports:

* Cash on Delivery
* Card Payment

Card payments can be integrated using a payment gateway in test mode.

---

## 🔒 Security

TrendKart implements several security practices:

* JWT authentication
* Protected API routes
* Admin authorization
* Password hashing using bcrypt
* Token-based API authorization
* Environment variables for sensitive backend configuration
* Role-based access control

---

## 📱 Responsive Design

The application is designed to work across different screen sizes:

* 💻 Desktop
* 🖥️ Laptop
* 📱 Mobile
* 📲 Tablet

Tailwind CSS is used to build the responsive user interface.

---

## ⚙️ Installation

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

### 2. Navigate to the Project

```bash
cd TrendKart
```

### 3. Install Backend Dependencies

```bash
cd server
npm install
```

### 4. Install Frontend Dependencies

```bash
cd ../client
npm install
```

---

## ▶️ Run the Project Locally

### Start Backend

Open a terminal:

```bash
cd server
npm run dev
```

Backend will run on:

```text
http://localhost:5000
```

### Start Frontend

Open another terminal:

```bash
cd client
npm run dev
```

Frontend will run on:

```text
http://localhost:5173
```

---

## 🔐 Environment Variables

Create a `.env` file inside the `server` folder.

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

> ⚠️ Never commit your `.env` file or sensitive credentials to GitHub.

---

## 🧪 API Testing

The backend APIs can be tested using **Postman**.

For protected routes, send the JWT token using the Authorization header:

```text
Authorization: Bearer YOUR_TOKEN
```

---

## 🚀 Deployment

### Frontend

The React frontend is deployed using **Vercel**.

**Live Demo:**
https://trend-kart-ten.vercel.app

### Backend

The Node.js/Express backend is deployed using **Render**.

The frontend communicates with the deployed backend through the API configuration in:

```text
client/src/services/api.js
```

---

## 📌 Future Improvements

Possible future improvements include:

* Wishlist functionality
* Product reviews and ratings
* Coupon system
* Pagination
* Advanced product filtering
* Email order notifications
* Improved payment integration
* User profile management
* Sales analytics
* Product recommendations
* Improved admin dashboard

---

## 🎯 Learning Outcomes

This project helped demonstrate practical experience with:

* MERN stack development
* React component development
* Redux state management
* REST API development
* MongoDB database integration
* Mongoose
* JWT authentication
* Role-based authorization
* Password hashing
* Cloudinary file uploads
* Payment integration
* API testing with Postman
* Git and GitHub
* Vercel deployment
* Render deployment
* Responsive UI development

---

## 👩‍💻 Author

**Krishna**

MERN Stack Developer

---

