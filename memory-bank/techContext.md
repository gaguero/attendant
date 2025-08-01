# Technical Context

This document outlines the technologies, tools, and environment setup for the Smart Hospitality Operations Platform.

## 1. Core Technologies

*   **Frontend**:
    *   **Framework**: React 18
    *   **Language**: TypeScript
    *   **Build Tool**: Vite
    *   **Styling**: Tailwind CSS
    *   **State Management**: Zustand (client-side), React Query (server-side)
    *   **Routing**: React Router v6
    *   **Form Handling**: Formik + Yup (to be evaluated against React Hook Form)

*   **Backend**:
    *   **Framework**: Node.js with Express.js
    *   **Language**: TypeScript
    *   **ORM**: Prisma
    *   **Database**: PostgreSQL (via Supabase)
    *   **Real-time**: WebSocket client for Mews integration (`ws` library)
    *   **HTTP Client**: Axios for Mews API integration
    *   **Retry Logic**: axios-retry for exponential backoff

*   **Shared**:
    *   **Package Manager**: pnpm with workspaces
    *   **Validation**: Zod for type-safe validation schemas

## 2. Development Environment

*   **Monorepo Management**: The project is set up as a pnpm workspace, which simplifies dependency management and enables code sharing across packages.
*   **API Proxy**: The Vite development server is configured to proxy all requests from `/api` to the backend server running on `localhost:3003`. This allows the frontend to communicate with the backend seamlessly during development.
*   **Hot Module Replacement (HMR)**: Both the frontend (via Vite) and the backend (via `tsx`) support hot reloading, which provides a fast and efficient development experience.
*   **Environment Variables**:
    *   The frontend and backend packages each have their own `.env` files for managing environment-specific configurations.
    *   It is crucial to set up the necessary variables, especially those for the database connection and Mews API, before running the application.

## 3. Mews Integration Details

*   **API Endpoint**: `https://api.mews-demo.com` (for the demo environment)
*   **WebSocket URL**: `wss://ws.mews-demo.com`
*   **Authentication**: The backend uses a Client Token and an Access Token to authenticate with the Mews API. These tokens are stored securely as environment variables.
*   **Rate Limiting**: The Mews demo environment has a rate limit of 500 requests per 15 minutes. The Mews API client on the backend respects this limit and includes appropriate handling with in-memory request tracking.
*   **Data Format**: All `datetime` values exchanged with the Mews API must be in UTC ISO 8601 format.
*   **Error Handling**: The Mews API client implements retry logic with exponential backoff for transient errors using the `axios-retry` library.

## 4. Database Schema

*   **Sync Tracking**: All models (User, Guest, Vendor) include `mewsId` (TEXT UNIQUE) and `syncedAt` (TIMESTAMP) fields for tracking synchronization status.
*   **Migration Management**: Database migrations are applied via Supabase SQL execution due to Prisma CLI connection issues with the current environment.
*   **Prisma Client**: Generated with sync tracking fields and ready for bidirectional synchronization.

## 5. Testing

*   **Backend**: Vitest will be used for unit and integration testing of the backend services and API endpoints. A separate test database will be used to ensure test isolation.
*   **Frontend**: React Testing Library with Vitest will be used for testing React components.
*   **End-to-End (E2E)**: Cypress is planned for E2E testing to simulate user workflows across the entire application.
*   **Mews Integration Testing**: Manual testing of API connectivity, WebSocket connections, and rate limiting is currently available.

## 6. Deployment

*   **Staging & Production**: Railway is the target platform for both staging and production environments.
*   **Containerization**: Docker will be used to containerize the backend application for consistent and reproducible deployments.
*   **CI/CD**: A continuous integration and deployment pipeline will be set up (e.g., using GitHub Actions) to automate testing and deployments.
