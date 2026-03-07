# Frontend - UIT Đăng ký học phần

React 18, Vite, TypeScript, TailwindCSS, Ant Design. Blue/white theme.

## Setup

```bash
npm install
npm run dev
```

For production build (used by Dockerfile.gateway):

```bash
npm run build
```

Output is `dist/`. API base URL: set `VITE_API_BASE_URL` (default `/api` when served behind same host).
