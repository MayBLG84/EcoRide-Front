# EcoRide Frontend

This project is the **frontend application of EcoRide**, a carpooling platform developed as part of the
**ECF (Évaluation des Compétences Finales)** for the _Graduate Développeur Angular 2023–2029_ program at Studi.

The application was generated using **Angular CLI 20.3.4** and is built with **Angular 20**, following a **standalone component architecture**.

The frontend communicates with a REST API developed with **Symfony** and focuses on providing a clear, accessible, and role-based user interface.

### 🚀 Quick Start (Local Installation)

You can run the project in **two ways**:

A. Local installation (Git + npm, without Docker)

1. Clone the repository
   `git clone https://github.com/MayBLG84/EcoRide-Front.git`

2. Navigate into the project directory
   `cd EcoRide-Front`

3. Install dependencies
   `npm install`

4. Start the development server
   `ng serve`
   (or `npm run start:local`)

5. Open your browser at
   `http://localhost:4200`

B. Using Docker

I. Development container with hot-load

1.  Ensure Docker is installed.
2.  Start the container
    `docker compose up --build`
    - The project files are mounted into the container, enabling hot-reload.
    - Angular will detect changes automatically without rebuilding the container.
    - Accessible at: http://localhost:4200 .

II. Pull pre-build image from Docker Hub (for reviewers or quick testing)

1.  Pull image from Docker Hub:
    `docker pull mblg/ecoride-front:dev`
2.  Run the container:
    `docker run -p 4200:4200 mblg/ecoride-front:dev`
    - This option is suitable for reviewers or colleagues who want a ready-to-run container.
    - Hot-reaload is **not available** in this mode; changes require rebuild and push.

⚠️ The frontend can start without the backend, but API calls will fail if the backend is not running.

### 🚀 Tech Stack

**Framework & Language**

- Angular 20
- Angular CLI 20.3.4
- TypeScript
- Standalone Components

**Styling & UI**

- SCSS
- Bootstrap 5
- Bootstrap Icons
- @ng-bootstrap/ng-bootstrap (date picker and UI components)
- ngx-bootstrap (optional additional Bootstrap components)
- @angular-slider/ngx-slider (slider components)

**Reactive Programming**

- RxJS

**Testing**

- Jest (unit testing)
- @testing-library/angular

**Runtime / Environment**

- Node.js
- npm

**Containerization**

- Docker – containerized local development
- Docker Compose – run the frontend locally with hot-reload

### ✅ Prerequisites if you don't use Docker

Before running the project locally, ensure the following tools are installed:

- **Node.js** (recommended: LTS ≥ 18)
- **npm**
- **Angular CLI** (version 20)

Check installed versions:

- `node -v`
- `npm -v`
- `ng version`

Install Angular CLI (if not installed):

- `npm install -g @angular/cli`

### 📦 Installation

A. If you don't use Docker

After cloning the repository:

- Install dependencies
  `npm install`

This will install Angular, Bootstrap, Jest, and all required development dependencies.

B. If you use Docker

Take a look at que Quick Start -> Using Docker at the top of this document

### ⚙️ Environment Configuration

The application uses Angular environment files for configuration.

Environment file location:

- _src/environments/environment.ts_

Development environment example:

- `production: false`
- `apiUrl: http://localhost:8000/api`

Notes:

- **apiUrl must match the backend URL**
- If the backend is not running, the application UI will load but API requests will fail

### ▶️ Running the Application

1. If you didn't use Docker for the installation, start the local development server:

- `ng serve`
  or
- `npm run start:local`

2. If you cloned the repository from Git and have Docker installed:

- `docker compose up --build`

3. If you cloned the repository from git and pulled the pre-build Docker image from Docker Hub:

- `docker run -p 4200:4200 mblg/ecoride-front:dev`

In all cases, the application will be available at:
`http://localhost:4200`

The page automatically reloads when source files are modified in the 1st and 2nd cases. In the 3rd case, changes require rebuild.

### 📁 Project Structure

The application follows a standalone architecture (no NgModule):

- src/
  - app/
    - components/ – _reusable UI components_
      - big-title
      - footer
      - header
      - search-bar
    - models/ – _domain models and interfaces_
    - pages/ – _routed views_
      - home
      - login
      - signup
      - results
      - my-space
      - contact
      - legal-mentions
      - errors
    - services/ – _HTTP services and API communication_
    - app.config.ts – _global providers configuration_
    - app.routes.ts – _application routing_
    - app.ts – _root standalone component_
  - assets/ – _static assets_
  - styles/ – _global SCSS styles_
  - index.html
  - main.ts – _application bootstrap_

### 🧩 Architecture Overview

This frontend is built using **Angular standalone components**:

- All components are declared with `standalone: true`
- No _AppModule_ is used
- Global providers are defined in _app.config.ts_
- Routing is configured in _app.routes.ts_
- Each component explicitly imports its own dependencies

This approach follows modern Angular best practices and improves modularity, readability, and maintainability.

### 🔌 Frontend–Backend Communication

The frontend communicates with the backend via HTTP requests using Angular services.

- Protocol: **HTTP**
- Data formats:
  - _application/json_
  - _multipart/form-data_ (FormData)

The backend exposes REST endpoints developed with **Symfony**.
The frontend acts purely as the presentation layer and does not implement heavy business logic.

### 🗄️ Data Management

The frontend does not interact directly with the database.

All data persistence, validation, and business logic are handled by the backend API, which communicates with a relational database.

### 🧪 Testing

Unit tests are configured using **Jest** (not Karma).

Available commands:

- Run all tests: `npm test`
- Run tests in watch mode: `npm run test:watch`
- Run tests with coverage report: `npm run test:coverage`
- Run tests in global (CI-friendly) mode: `npm run test:global`

**Test Reports**
The _test:global_ script is designed for CI pipelines or global test execution:

- Tests are executed sequentially using --runInBand
- A test report in **XML format** is generated
- Reports are saved in: reports/jest

This setup allows integration with CI tools and test report analyzers.

### 🏗️ Build

To build the project for production:

- `ng build`

The build artifacts are stored in the _dist/_ directory.
Production builds are optimized for performance and speed.

### 🚫 End-to-End Tests

End-to-end (e2e) testing is not configured by default.

Angular CLI does not include an e2e framework automatically.
If needed, a solution such as **Cypress** or **Playwright** can be added later.

### ⚠️ Common Issues

**Port already in use**

- Local:
  `ng serve --port 4300`
- Docker:
  update _docker-compose.yaml_ ports mapping, e.g., `"4300:4200"`

**API connection errors**

- Ensure the backend is running
- Check the _apiUrl_ value in the environment file
- Docker dev container: backend must be reachable inside container

**Hot-reload not working**

- Only works with local npm setup or Docker developement container
- Pre-build Docker Hub images require rebuild

### 🎯 Functional Scope

The frontend implements the functional requirements defined in the project specifications and supports multiple user roles:

- Visitor
- Passenger
- Driver
- Employee
- Administrator

Frontend responsibilities:

- Displaying data provided by the backend
- Managing navigation and user flows
- Handling user input through forms
- Sending HTTP requests
- Adapting the UI according to user roles

### 🧭 User Stories Coverage (Frontend Perspective)

**Visitor**

- Home page with company presentation
- Carpooling search bar
- Navigation menu (home, carpooling, login, contact)
- Search by city and date
- Results list with filters (price, duration, rating, ecological trip)
- Carpooling trip details
- Account creation with secure password

**Passenger**

- Participation in a carpool with seat and credit verification
- Double confirmation before booking
- Personal space
- Carpooling history and cancellation
- Post-trip confirmation and review submission
- Same account cancellation capabilities as Passenger

**Driver**

- Ride creation
- Carpooling history and cancellation
- Vehicle and preferences management
- Trip start and end actions
- Account cancellation by the user

**Employee**

- Validation or rejection of driver reviews
- Access to reported trips

**Administrator**

- Employee account creation
- Statistics dashboards
- Suspension of user or employee accounts

### 🛠️ Development Tools

Recommended tools:

- **Visual Studio Code**
- **Angular Language Service**
- **Prettier**
- **Node.js & npm**

### 💻 OS Notes

**These notes apply only if you are running the project without Docker.**

These instructions assume Linux (Ubuntu). For other operating systems:

- Node.js, npm, PHP, and Symfony CLI installation may vary.
- On Windows, use CMD/PowerShell and adjust paths accordingly.
- Ensure MySQL and MongoDB are installed and running. Port numbers may differ.
- Linux/macOS are case-sensitive for file paths.

### 🌍 Language

- User interface: **French**
- Source code and technical documentation: **English**

### 👤 Academic Context

This frontend application was developed as part of the _Graduate Développeur Angular 2023–2029_ program at **Studi**, within the scope of the ECF (final competency evaluation).
