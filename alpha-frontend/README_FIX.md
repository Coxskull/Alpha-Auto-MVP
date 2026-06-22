# Alpha Frontend Correct Structure

This zip combines Customer, Driver, Provider, and Mission Control into one proper Next.js app.

## Correct structure

- `app/customer/*`
- `app/driver/*`
- `app/provider/*`
- `app/mission-control/*`
- `components/*`
- `services/*`
- `types/*`
- `resources/*`

There are no nested `.next`, `node_modules`, or extra `package.json` files inside `app/*`.

## Install and run

```bash
cd alpha-frontend
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Environment

Create `.env.local` in the root folder:

```env
NEXT_PUBLIC_API_URL=https://alpha-backend-production-673a.up.railway.app
```

## Main routes

- `/mission-control/dashboard`
- `/customer`
- `/driver/dashboard`
- `/provider/dashboard`

`/dashboard` redirects to `/mission-control/dashboard` for compatibility.
