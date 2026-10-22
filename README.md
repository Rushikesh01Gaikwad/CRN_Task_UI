# Product Management System - Frontend

Frontend application built with Angular 15 for managing products and inventory stock items, connecting to the ASP.NET Core Web API backend.

## Features

- **Products Management**:
  - View paginated list of products with search and configurable page sizes.
  - Create new products with optional initial stock items.
  - Edit product details and author information.
  - Delete products with confirmation.
- **Stock & Inventory Items**:
  - View, add, update, and remove inventory items for each product.
- **Authentication**:
  - User registration and login with JWT token support.
  - Automatic Authorization header injection for API requests.
- **API Configuration**:
  - Configurable backend API base URL with connection test.

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── api-config-modal/      # Backend API endpoint settings
│   │   ├── auth-modal/            # Login & registration dialog
│   │   ├── item-manager-modal/    # Product inventory items dialog
│   │   ├── navbar/                # Top navigation header
│   │   └── toast/                 # Notification alerts
│   ├── interceptors/
│   │   └── auth.interceptor.ts    # JWT token interceptor
│   ├── models/                    # TypeScript interfaces for Product, Item, Auth
│   ├── pages/
│   │   └── products/              # Main products dashboard
│   ├── services/
│   │   ├── api-config.service.ts  # API URL configuration service
│   │   ├── auth.service.ts        # Authentication state & token management
│   │   ├── product.service.ts     # Products & Items HTTP client
│   │   └── toast.service.ts       # Alert notifications service
│   ├── app.module.ts              # Root Angular module
│   └── app-routing.module.ts      # Application routes
├── styles.scss                    # Global styling & layout
└── index.html                     # HTML root
```

## Running the Project

### Prerequisites
- Node.js (v18 or v20 LTS)
- Angular CLI

### Steps to Run
1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Open `http://localhost:4200` in your browser.

### Backend API
Ensure the backend API (`CRUD_API`) is running. By default, the application connects to `https://localhost:7025`. You can switch the endpoint to HTTP (`http://localhost:5287`) using the API button in the top navigation bar.
