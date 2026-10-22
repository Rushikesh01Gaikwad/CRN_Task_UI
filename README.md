# 🎨 Product & Inventory Management UI — CRN Technical Solution

A modern, responsive, enterprise-grade Single Page Application (SPA) built with **Angular 15**, **TypeScript**, and **Custom SCSS**, providing an intuitive interface for managing products, auditing history, hierarchical stock items, and secure user authentication.

---

## 📑 Table of Contents
1. [Overview & User Experience](#-overview--user-experience)
2. [What Was Built (Completed Work)](#-what-was-built-completed-work)
3. [Architecture & Project Structure](#-architecture--project-structure)
4. [UI & API Connectivity Flow](#-ui--api-connectivity-flow)
5. [Authentication & Silent Token Refresh](#-authentication--silent-token-refresh)
6. [Dynamic API Configuration & Health Probe](#-dynamic-api-configuration--health-probe)
7. [Component & Service Catalog](#-component--service-catalog)
8. [Setup & Running Guide](#-setup--running-guide)
9. [Connectivity Troubleshooting & SSL Guide](#-connectivity-troubleshooting--ssl-guide)
10. [Testing & Build](#-testing--build)

---

## 🌟 Overview & User Experience

The application is engineered to provide an engaging experience with clean aesthetics, instant visual feedback, and zero clunky page reloads:
- **Clean Dashboard**: Data-dense table showing Product ID, Name, Creator, Creation Date, Modification Date, and Stock Item counts.
- **Micro-Interactions**: Hover states, smooth modal popups, live badges, and toast notification alerts.
- **Zero-Friction API Switching**: Connect to HTTPS (`https://localhost:7025`), HTTP (`http://localhost:5287`), or a custom production URL on-the-fly without rebuilding the application.

---

## ✅ What Was Built (Completed Work)

### 1. Products Management Interface
- **Server-Side Pagination**: Full page control (Previous/Next, numbered page buttons, item range indicators) synchronized with backend `page` and `pageSize`.
- **Configurable Page Size**: Dynamic dropdown to switch between 5, 10, 20, or 50 items per page.
- **Instant Search Bar**: Debounced keyword filtering querying product names and creator records.
- **Create & Edit Modals**: Responsive modal forms with validation, error banners, and automatic author auditing.
- **Safe Delete Modal**: Explicit confirmation prompt preventing accidental data loss.

### 2. Hierarchical Stock Items Manager (`[dbo].[Item]`)
- **Dedicated Modal for Sub-Resources**: Clicking **"Manage Stock"** on any product loads its dedicated item sub-resource manager.
- **Stock Quantity Management**: Direct addition of stock units to existing products.
- **Inline Editing & Removal**: Modify item quantities in-place or remove individual stock entries.
- **Live Inventory Summary**: Badges showing total items and aggregated stock count for each product.

### 3. Authentication & User State
- **Tabbed Auth Modal**: Smooth tab switching between **Sign In** and **Create Account**.
- **Stateful Navigation Header**: Displays current active user, role badge (`Admin`/`User`), and one-click Logout.
- **Local Storage Persistence**: Safely saves JWT access tokens and user profile to maintain session upon browser refresh.

### 4. Smart HTTP Interceptor & Token Refresh
- **Authorization Header Injection**: Automatically attaches `Bearer <token>` to all backend requests.
- **Seamless 401 Interception**: Intercepts expired token errors, transparently calls `/api/v1/auth/refresh-token`, queues pending requests, and retries the original request without user interruption.
- **Automatic Fallback**: If token refresh fails or is revoked, automatically clears session and opens the login dialog.

### 5. Dynamic Backend Configuration & Latency Checker
- **Live Connection Testing**: Checks backend availability against `/swagger/v1/swagger.json` and `/api/v1/products`.
- **Latency Benchmarking**: Measures and displays round-trip time in milliseconds (e.g. `Connected • 24ms`).
- **Endpoint Switcher**: Instant one-click radio toggle between HTTPS (`:7025`), HTTP (`:5287`), or custom server IP.

### 6. Centralized Toast Notification System
- **Reactive Toast Alerts**: Non-intrusive alert banners for Success, Error, Warning, and Info states with 4-second auto-dismiss and manual dismissal.

---

## 🏛️ Architecture & Project Structure

The project follows Angular best practices with feature-focused organization and single responsibility principles:

```
CRUD_UI/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── navbar/                  # Header with user profile, API status badge & triggers
│   │   │   ├── auth-modal/              # Login & registration forms with validation
│   │   │   ├── item-manager-modal/      # Stock item sub-resource manager dialog
│   │   │   ├── api-config-modal/        # Live API probe, latency tester & URL switcher
│   │   │   └── toast/                   # Centralized floating notification alerts
│   │   │
│   │   ├── interceptors/
│   │   │   └── auth.interceptor.ts      # Automatic JWT injection & 401 refresh handler
│   │   │
│   │   ├── models/                      # Strongly-typed TypeScript interfaces
│   │   │   ├── product.model.ts         # Product, Item, CreateProductDto, UpdateProductDto
│   │   │   ├── auth.model.ts            # LoginRequest, RegisterRequest, AuthResponse, UserSession
│   │   │   └── common.model.ts          # ApiResponse<T>, PagedResult<T>
│   │   │
│   │   ├── pages/
│   │   │   └── products/                # Main dashboard page (table, search, pagination, modals)
│   │   │       ├── products.component.ts
│   │   │       ├── products.component.html
│   │   │       └── products.component.scss
│   │   │
│   │   ├── services/                    # RxJS-powered Singleton Services
│   │   │   ├── api-config.service.ts    # Base URL state & health/ping probe
│   │   │   ├── auth.service.ts          # Authentication state, login, register, token refresh
│   │   │   ├── product.service.ts       # Products & Items CRUD HTTP client
│   │   │   └── toast.service.ts         # Observables for system-wide toast triggers
│   │   │
│   │   ├── app.module.ts                # App declarations, HttpClientModule, FormsModule
│   │   ├── app-routing.module.ts        # Route configuration
│   │   └── app.component.html           # Root shell (Navbar + RouterOutlet + Modals + Toasts)
│   │
│   ├── styles.scss                      # Global variables, typography, reset & layout utilities
│   ├── index.html                       # HTML5 entry with Google Fonts (Inter)
│   └── main.ts                          # Bootstrap entry point
```

---

## 🔄 UI & API Connectivity Flow

The UI communicates directly with the ASP.NET Core backend over HTTP/HTTPS:

```
+-----------------------------------------------------------------------------------------+
|                                    USER INTERACTION                                     |
|           (Search input, Pagination click, Add Product, Edit Item, Login)               |
+-----------------------------------------------------------------------------------------+
                                             |
                                             v
+-----------------------------------------------------------------------------------------+
|                                  ANGULAR COMPONENT                                      |
|    - Captures user input & runs form validation                                         |
|    - Calls ProductService, AuthService, or ApiConfigService                             |
|    - Dispatches loading spinners and feedback toasts                                    |
+-----------------------------------------------------------------------------------------+
                                             |
                                             v
+-----------------------------------------------------------------------------------------+
|                                   ANGULAR SERVICE                                       |
|    - Obtains base URL dynamically from ApiConfigService (e.g. https://localhost:7025)   |
|    - Assembles RESTful path: `/api/v1/products?page=1&pageSize=10`                      |
|    - Unwraps standard envelope: `ApiResponse<T>.data`                                   |
+-----------------------------------------------------------------------------------------+
                                             |
                                             v
+-----------------------------------------------------------------------------------------+
|                                  AUTH INTERCEPTOR                                       |
|    - Checks localStorage for `crn_access_token`                                         |
|    - Clones request and appends: `Authorization: Bearer <token>`                        |
+-----------------------------------------------------------------------------------------+
                                             |
                                    (HTTP REST Request)
                                             |
                                             v
+-----------------------------------------------------------------------------------------+
|                                 .NET 8 WEB API BACKEND                                  |
|                      (https://localhost:7025 or http://localhost:5287)                   |
|    - Validates CORS (Allowed Origin: http://localhost:4200)                             |
|    - Authenticates JWT (if token provided)                                              |
|    - Executes Controller -> Service -> EF Core -> SQL Server Database                   |
|    - Returns JSON payload: { success: true, data: { ... } }                             |
+-----------------------------------------------------------------------------------------+
                                             |
                                    (JSON HTTP Response)
                                             |
                                             v
+-----------------------------------------------------------------------------------------+
|                                COMPONENT SUBSCRIPTION                                   |
|    - Receives typed PagedResult<Product> or Item[]                                      |
|    - Triggers Angular change detection to update table & UI                             |
|    - Emits success toast via ToastService                                               |
+-----------------------------------------------------------------------------------------+
```

---

## 🔐 Authentication & Silent Token Refresh

The frontend manages authentication state and token refresh seamlessly:

```
[UI Request] ---> [AuthInterceptor: Has Token?] ---> Yes ---> [Attach Bearer Token] ---> [Send to API]
                                                                                               |
                                                                                        (Is Response 401?)
                                                                                               |
             +---------------------------------------------------------------------------------+
             |
             v
   [Is Refreshing already?]
     ├── No  ---> 1. Set isRefreshing = true
     │            2. Call POST /api/v1/auth/refresh-token with { token, refreshToken }
     │            3. Save new access & refresh tokens in localStorage
     │            4. Update currentUserSubject
     │            5. Retry original request with new token
     │
     └── Yes ---> Wait for ongoing refresh to complete, then retry request with new token
```

---

## ⚙️ Dynamic API Configuration & Health Probe

The UI does not hardcode backend addresses. Instead, it utilizes `ApiConfigService`:
1. **Initial Resolution**: Checks `localStorage.getItem('crn_api_base_url')`. If absent, defaults to `https://localhost:7025`.
2. **Ping & Latency Test**:
   - Sends an HTTP GET request to `/swagger/v1/swagger.json` with a 3.5s timeout.
   - If that succeeds, measures `performance.now() - startTime` to compute latency.
   - If Swagger endpoint fails, tests `/api/v1/products?page=1&pageSize=1` as fallback.
   - If both fail, flags the endpoint as `Unreachable` and suggests switching to HTTP (`http://localhost:5287`) in case of SSL/TLS certificate bypass needs.
3. **Reactive Broadcast**: Components and services subscribe to `baseUrl$`. Changing the URL updates all future HTTP calls immediately.

---

## 📦 Component & Service Catalog

### Components
| Component | Selector | Purpose |
| :--- | :--- | :--- |
| **`NavbarComponent`** | `<app-navbar>` | Header displaying title, live API connection status badge, login/register triggers, and user profile |
| **`ProductsComponent`** | `<app-products>` | Primary view containing the searchable product table, pagination, create/edit modal, and delete confirmation |
| **`ItemManagerModalComponent`** | `<app-item-manager-modal>` | Dialog for viewing, adding, updating, and removing inventory items for a selected product |
| **`AuthModalComponent`** | `<app-auth-modal>` | Modal for logging in or signing up with client-side validation and error messages |
| **`ApiConfigModalComponent`** | `<app-api-config-modal>` | Modal allowing users to test and switch backend API endpoints and view live latency |
| **`ToastComponent`** | `<app-toast>` | Floating notification container presenting dismissible success, error, warning, and info alerts |

### Services
| Service | Injectable | Purpose |
| :--- | :--- | :--- |
| **`ProductService`** | `providedIn: 'root'` | Handles all CRUD operations for Products (`/api/v1/products`) and Items (`/api/v1/products/{id}/items`) |
| **`AuthService`** | `providedIn: 'root'` | Manages user session, login, registration, token refresh, and logout |
| **`ApiConfigService`** | `providedIn: 'root'` | Manages the dynamic backend URL and performs latency & health checks |
| **`ToastService`** | `providedIn: 'root'` | Dispatches reactive notifications across the application |

---

## 🚀 Setup & Running Guide

### Prerequisites
- **Node.js**: v18.x or v20.x LTS
- **npm**: v9.x or v10.x (bundled with Node.js)
- **Angular CLI** (optional): `npm install -g @angular/cli`

### Step 1: Install Dependencies
Open a terminal in the `CRUD_UI` directory:
```bash
cd "d:/CRN Tech Soft Task/CRUD_UI"
npm install
```

### Step 2: Start the Development Server
```bash
npm start
# or: ng serve
```
The server will compile the SCSS and TypeScript and output:
```
✔ Browser application bundle generation complete.
** Angular Live Development Server is listening on localhost:4200, open your browser on http://localhost:4200/ **
```

### Step 3: Access the Application
Open your web browser and navigate to:
```
http://localhost:4200
```

---

## 🔍 Connectivity Troubleshooting & SSL Guide

When connecting the Angular UI (`http://localhost:4200`) to the .NET Web API (`https://localhost:7025`), browsers may block requests if the local ASP.NET Core developer SSL certificate is untrusted.

### Quick Fix Options:

#### Option A: Trust the .NET Dev Certificate (Recommended)
Run the following command in PowerShell / Terminal:
```bash
dotnet dev-certs https --trust
```

#### Option B: Switch to Plain HTTP (Instant One-Click)
1. In the Angular UI, click the **"API: https://..."** button in the top navigation bar.
2. Select the **"HTTP (Port 5287)"** preset (`http://localhost:5287`).
3. Click **"Test Connection"** to verify green status, then click **"Save & Apply"**.
4. The UI will instantly communicate with the backend without any SSL certificate restrictions.

#### Option C: Visit the API directly once in browser
Navigate to `https://localhost:7025/swagger` in your browser and click **"Advanced -> Proceed to localhost (unsafe)"**. This authorizes the self-signed certificate for your current browser session.

---

## 🧪 Testing & Build

### Running Unit Tests
```bash
npm test
```
Executes Karma/Jasmine unit tests for all components and services.

### Production Build
```bash
npm run build
```
Generates an optimized, ahead-of-time (AOT) compiled production bundle in the `dist/crud-ui` directory ready for deployment to IIS, Nginx, Azure Static Web Apps, or AWS S3.
