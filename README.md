
# Food Ecommerce Backend

This repository contains the backend code for the **Food Ecommerce** platform, a service that allows users to browse, order, and manage food items. This backend is built using Node.js, Express, and MongoDB.

## Features

- **User Authentication and Authorization**: Secure registration and login using JWT.
- **Product Management**: Create, read, update, and delete food items.
- **Menu Management**: Users can place, view, and manage their orders.
- **Category Management**: Organize products into categories for easier navigation.
- **Admin Panel**: Manage users, products, and orders.

## Technology Stack

- **Node.js**: JavaScript runtime for building scalable server-side applications.
- **Express.js**: Web framework for building RESTful APIs.
- **MongoDB**: NoSQL database for storing application data.
- **Mongoose**: ODM (Object Data Modeling) library for MongoDB.
- **JWT (JSON Web Tokens)**: For user authentication and authorization.
- **Bcrypt**: For hashing passwords.
- **Dotenv**: For managing environment variables.

## Prerequisites

Before you begin, ensure you have met the following requirements:

- **Node.js** (v14 or later)
- **MongoDB** (v4.4 or later)
- **npm** (v6 or later) or **yarn** (v1.22 or later)

## Getting Started

### 1. Clone the Repository

```bash
git clone (https://github.com/Medcell1/food_ecommerce-backend/)
cd food_ecommerce_backend
```

### 2. Install Dependencies

```bash
npm install
```

or

```bash
yarn install
```

### 3. Environment Variables

Create a `.env` file in the root of your project and configure the following variables:

```env
# Application settings
PORT=3000

# JWT Secret
JWT_SECRET=your_jwt_secret

```

### 4. Start the Server

```bash
npm start
```

or

```bash
yarn start
```

By default, the server runs on `http://localhost:3000`.

## Contributing

Contributions are welcome! Please fork this repository, make your changes, and submit a pull request. 

