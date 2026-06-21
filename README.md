# MergeWise

AI-powered pull request review UI built with **Next.js (App Router)**, **JavaScript only**, and a live analyzer API.

## Run locally

```bash
cd mergewise
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Paste a GitHub PR URL on the home page to call the configured `POST /api/pr/analyze` endpoint and open the dashboard.

## Project location

The app lives in the `mergewise/` directory (npm package name must be URL-safe).

## Stack

- Next.js 15, React 19, CSS Modules + global theme CSS  
- Axios, Framer Motion, Recharts, React Icons, React Syntax Highlighter, React Diff Viewer, React Toastify, Day.js  
- Client-side history + snapshots via `localStorage` / `sessionStorage`

## API

Default endpoint is set in `constants/api.js`. Update the URL if your tunnel or deployment changes.

## Scripts

| Command        | Description              |
| -------------- | ------------------------ |
| `npm run dev`  | Development server       |
| `npm run build`| Production build         |
| `npm run start`| Start production server  |
| `npm run lint` | ESLint                   |
