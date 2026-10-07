# ZaadMart POS

ZaadMart is a full-stack Point of Sale (POS) and retail management system designed for mini-market and retail operations.

The project is being developed to provide a modern platform for managing products, inventory, customers, sales, payments, users, permissions, and other day-to-day retail operations.

> **Project Status:** 🚧 In Active Development

The backend architecture and several core modules have been implemented. Additional POS functionality and the frontend application are under development.

## Current Backend Features

### Authentication & Security
- JWT-based authentication
- Password hashing with bcrypt
- Login rate limiting
- Helmet security middleware
- Role-based access control
- Permission-based route protection
- Initial administrator creation

### User & Role Management
- User management
- Role management
- Role and permission authorization
- User activation and access controls

### Product Management
- Product creation and management
- Product categories
- Product brands
- Multiple product units
- Unit conversion support
- Multiple product barcodes
- Product selling prices
- Product price history

### Customer Management
- Customer records
- Customer codes
- Customer account management
- Customer payments
- Customer statement architecture

## Backend Architecture

The backend follows a layered architecture:

**Routes → Controllers → Services → Repositories → PostgreSQL**

Supporting components include:

- Validators
- Authentication middleware
- Permission middleware
- Centralized error handling
- Database transaction handling
- Pagination utilities
- Query helpers
- Standardized API responses

## Technology Stack

### Backend
- Node.js
- Express.js
- PostgreSQL
- JSON Web Tokens (JWT)
- bcrypt
- Helmet
- Express Rate Limit
- CORS
- dotenv

### Development Tools
- Visual Studio Code
- DBeaver
- Postman
- Git
- GitHub

### Frontend

A React-based frontend is planned as part of the ongoing development of the system.

## Project Structure

```text
ZaadMart/
├── backend/
│   ├── scripts/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── validators/
│   ├── package.json
│   └── server.js
├── .env.example
├── .gitignore
└── README.md
```

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd ZaadMart
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Configure Environment Variables

Create a `.env` file inside the `backend` directory and configure the required environment variables.

See `.env.example` in the project root for the required variables.

### 4. Start the Development Server

```bash
npm run dev
```

The API can be configured to run locally on:

```text
http://localhost:5050
```

## Development Roadmap

Planned and ongoing development includes:

- Complete sales/POS workflow
- Inventory movement tracking
- Stock counts and adjustments
- Purchasing and supplier management
- Returns and refunds
- Cashier shift management
- Expense management
- Reporting and analytics
- React frontend
- Dashboard and management interface
- Payment integrations
- Kenya-specific retail integrations

## Purpose

ZaadMart is being developed as a practical retail management platform rather than a demonstration-only application. Its architecture is designed around real mini-market workflows and operational requirements.

## Author

**Abdirahman Abdullahi**

Full-Stack Developer

---

This project is under active development. Features and architecture may change as development continues.