# TaskFlow Angular Enterprise Client

An enterprise-grade frontend client for the MERN Task Manager built with **Angular 17+ Standalone Components**, **RxJS**, **Angular Router**, and modern CSS.

## Architecture
- **Standalone Architecture**: Zero `NgModule` overhead, utilizing clean standalone components (`NavbarComponent`, `LoginComponent`, `RegisterComponent`, `BoardComponent`, `TaskModalComponent`).
- **Reactive State**: `AuthService` manages authentication state with RxJS `BehaviorSubject` streams.
- **Functional Interceptors**: `authInterceptor` automatically attaches the `x-auth-token` JWT header to all outgoing HTTP requests.
- **Route Guards**: `authGuard` protects the `/board` route from unauthenticated access.
- **Kanban Board**: Three-stage task workflow (`To-Do`, `In Progress`, `Done`) with real-time updates and status advancement.

## Getting Started

```bash
cd angular-client
npm install
npm start
```

The application will be accessible at `http://localhost:4200`.
