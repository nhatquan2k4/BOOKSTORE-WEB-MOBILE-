This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

## Environment Files

- `.env.local`: loaded automatically by Next.js in development. It sets `NEXT_PUBLIC_API_URL` to a localhost URL.
- `.env.ngrok`: for testing with a public Ngrok URL. Next.js does not auto-load this file, so use one of the options below.

### Using localhost (default)
- Update `NEXT_PUBLIC_API_URL` in `.env.local` if needed.
- Run: `npm run dev`.

### Using Ngrok URL
Choose one:
- Quick swap: temporarily rename `.env.ngrok` to `.env.local` before `npm run dev`.
- Or set it per-run in PowerShell (Windows):

```powershell
$env:NEXT_PUBLIC_API_URL="https://your-subdomain.ngrok-free.app"; npm run dev
```

### Variable used in code
- Read the value via `process.env.NEXT_PUBLIC_API_URL` in client code.
- Ensure API clients build URLs from this base to switch between environments.

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
