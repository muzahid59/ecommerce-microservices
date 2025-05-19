# ecommerce-microservices

A modular e-commerce platform built with Node.js, Express, TypeScript, and PostgreSQL, following a microservices architecture. Each core domain (auth, user, product, inventory, email) is implemented as an independent service, with an API Gateway for unified access and routing.

## Features

- **API Gateway**: Central entry point for all client requests, with route forwarding, authentication, and rate limiting.
- **Auth Service**: Handles user registration, login, JWT authentication, and email verification.
- **User Service**: Manages user profiles and related data.
- **Product Service**: Manages product catalog, including inventory integration.
- **Inventory Service**: Tracks product stock and inventory history.
- **Email Service**: Sends transactional emails (e.g., verification, notifications).

## Tech Stack

- Node.js, Express, TypeScript
- PostgreSQL (via Prisma ORM)
- Docker (for local development)
- Zod (for schema validation)
- Axios (for inter-service communication)

## Getting Started

### Prerequisites

- Node.js v20+
- Docker & Docker Compose
- PostgreSQL

### Setup

1. **Clone the repository**
   ```sh
   git clone https://github.com/your-username/ecommerce-microservices.git
   cd ecommerce-microservices

2. **Start dependencies (Postgres, Mailhog, PgAdmin)**
   ```sh
   docker-compose up -d
   ```

3. **Configure environment variables**
    Each service has its own .env file. Create .env and adjust as needed.

4. **Install dependencies and run services**
    ```sh
    cd services/user
    npm install
    npm run dev
    ```
    Repeat for other services (auth, product, inventory, email, api-gateway).

5. **Run database migrations.**
    ```sh
    npm run migrate:dev
    ```

### API Overview
  - All endpoints are accessed via the API Gateway (http://localhost:8081/api/...)
  - Auth endpoints: /api/auth/register, /api/auth/login, etc.
  - User endpoints: /api/users/:id
  - Product endpoints: /api/products, /api/products/:id
  - Inventory endpoints: /api/inventories/:id
  - Email endpoints: /api/emails/send
