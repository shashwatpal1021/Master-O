# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Backend API integration

This frontend communicates with the backend API at `http://localhost:4000/api` by default. The app relies on cookie-based authentication (HttpOnly cookies set by the backend); the Axios instance is configured with `withCredentials: true` to send cookies with each request.

Important notes:
- Login (`POST /api/auth/login`) returns the user object and sets `access_token` (short-lived) and `refresh_token` cookies.
- Subsequent API requests (e.g., `GET /api/tasks`) use cookies for authentication.
- Logout (`POST /api/auth/logout`) clears and revokes cookies on the backend.
