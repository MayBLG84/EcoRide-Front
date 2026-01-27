# EcoRide Frontend

This project is the **frontend application of EcoRide**, a carpooling platform developed as part of the  
**ECF (Évaluation des Compétences Finales)** for the _Graduate Developer_ program at **Studi**.

The project was generated using **Angular CLI 20.3.4** and is built with **Angular 20** using a  
**standalone component architecture**.

The frontend communicates with a backend REST API developed with **Symfony** and focuses on providing
a clear, accessible, and role-based user interface.

---

## 🚀 Tech Stack

**Framework & Language**

- Angular 20
- Angular CLI 20.3.4
- TypeScript
- Standalone Components

**Styling & UI**

- SCSS
- Bootstrap 5
- Bootstrap Icons
- @ng-bootstrap/ng-bootstrap (for ngbDatePicker and other UI components)
- ngx-bootstrap (optional, additional Bootstrap components)
- @angular-slider/ngx-slider (slider UI components)

**Reactive Programming**

- RxJS

**Testing**

- Jest (unit testing)
- @testing-library/angular (unit testing utilities)

**Runtime / Environment**

- Node.js / npm

---

## 📁 Project Structure

The application follows a **standalone architecture** (no `NgModule`).

src/
├── app/
│ ├── components/ # Reusable UI components
│ │ ├── big-title
│ │ ├── footer
│ │ ├── header
│ │ └── search-bar
│ ├── models/ # Domain models and interfaces
│ ├── pages/ # Routed views
│ │ ├── home
│ │ ├── login
│ │ ├── signup
│ │ ├── results
│ │ ├── my-space
│ │ ├── contact
│ │ ├── legal-mentions
│ │ └── errors
│ ├── services/ # HTTP services (API communication)
│ ├── app.config.ts # Global providers configuration
│ ├── app.routes.ts # Application routing
│ └── app.ts # Root standalone component
├── assets/ # Static assets
├── styles/ # Global SCSS styles
├── index.html
└── main.ts # Application bootstrap

---

## 🧩 Architecture Overview

This frontend is built using **Angular standalone components**:

- All components are declared with `standalone: true`
- No `AppModule` is used
- Global providers are defined in `app.config.ts`
- Routing is configured in `app.routes.ts`
- Each component explicitly imports its own dependencies

This approach follows Angular modern best practices and improves modularity, readability, and maintainability.

---

## 🔌 Frontend–Backend Communication

The frontend communicates with the backend via **HTTP requests** using Angular services.

- Protocol: **HTTP**
- Data formats:
  - `application/json`
  - `multipart/form-data` (FormData)

The backend exposes REST endpoints developed with **Symfony**.
The frontend acts as the visual layer (views) and does not implement heavy business logic.

---

## 🗄️ Data Management

The frontend does not interact directly with the database.  
All data persistence, validation, and business logic are handled by the backend API, which communicates with a relational database.

---

## ✅ Prerequisites

Before running the project locally, ensure you have the following installed:

- **Node.js** (recommended: LTS ≥ 18)
- **npm**
- **Angular CLI** (version 20)

### Check Installed Versions

    bash:```
    node -v
    npm -v
    ng version
    ```

### Install Angular CLI (if not installed)

bash: `npm install -g @angular/cli`

## 📦 Installation

1. Clone the repository:

   `git clone <repository-url>`
   `cd eco-ride-front`

2. Install dependencies:

   `npm install`

This installs Angular, Bootstrap, Jest, and all required development dependencies.

## ⚙️ Environment Configuration

Angular environment files are used to configure the application.

_Example:_

```ts
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api',
};
```

- apiUrl must match the backend URL.
- The frontend can start without the backend, but API calls will fail.

### ▶️ Development Server

To start a local development server, run:`ng serve`

or:`npm start`

Once the server is running, open your browser and navigate to:
'http://localhost:4200/'

The application automatically reloads when source files are modified.

### 🧱 Code Scaffolding

Angular CLI provides code scaffolding tools.

To generate a new standalone component:`ng generate component component-name`

For a full list of available schematics:`ng generate --help`

### 🏗️ Building the Project

To build the project:`ng build`

The build artifacts are stored in the dist/ directory.
Production builds are optimized for performance and speed.

### 🧪 Running Unit Tests

Unit tests are configured using Jest (not Karma).

Run all tests:`npm test`

Run tests in watch mode:`npm run test:watch`

Generate test coverage:`npm run test:coverage`

### 🚫 End-to-End Tests

End-to-end (e2e) testing is not configured by default in this project.
Angular CLI does not include an e2e framework automatically.
If needed, a solution such as Cypress or Playwright can be added later.

### ⚠️ Common Issues

Port already in use

    `ng serve --port 4300`

- API connection errors
  - Ensure the backend is running
  - Check the apiUrl value in the environment file

### 🎯 Functional Scope

The frontend implements the functional requirements defined in the project specifications and supports multiple user roles:
Visitor, User, Employee, and Administrator.

The frontend is responsible for:

- Displaying data provided by the backend
- Managing navigation and user flows
- Handling user input through forms
- Sending HTTP requests
- Adapting the UI according to user roles

### 🧭 User Stories Coverage (Frontend Perspective)

**Visitor**

- Home page with company presentation and images
- Search bar for carpooling itineraries
- Navigation menu (home, carpooling, login, contact)
- Carpooling search by city and date
- Results list with filters (price, duration, rating, ecological trip)
- Detailed view of a carpooling trip
- Account creation with secure password

**User**

- Participation in a carpool (with seat and credit verification)
- Double confirmation before booking
- Personal space (driver, passenger, or both)
- Vehicle and preferences management
- Trip creation as a driver
- Carpooling history and cancellation
- Trip start and end actions
- Post-trip confirmation and review submission

**Employee**

- Validation or rejection of driver reviews
- Access to trips reported as problematic

**Administrator**

- Employee account creation
- Statistics dashboards (number of carpools, platform earnings)
- Suspension of user or employee accounts

### 🛠️ Development Tools

Recommended tools:

- **Visual Studio Code**
- **Angular Language Service**
- **Prettier**
- **Node.js & npm**

### 🌍 Language

- User interface: **French**
- Source code and technical documentation: **English**

### 👤 Academic Context

This frontend application was developed as part of the _Graduate Développeur Angular 2023-2029_ program at _Studi_, within the scope of the ECF (final competency evaluation).
