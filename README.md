This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

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

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.




Why a separate client component?
page.js is a Server Component — it can't use useState. But sorting requires state (which sort is active). Instead of making the entire page a client component, we extract just the reviews section into its own "use client" component. This is the correct Next.js pattern — keep the server component for data fetching, push "use client" as deep/narrow as possible.
What's in it:

Count — Reviews (13) in the header
Avg rating — ★ 4.2/5 next to count
Date — new Date(r.createdAt).toLocaleDateString("en-IN", ...) formats as 12 Jan 2025. Works because Mongoose timestamps: true adds createdAt automatically
Sort bar — pill-style toggle: Newest / Oldest / Highest / Lowest. Hides itself if only 1 review (no point sorting 1 item)
Active sort gets bg-white shadow-sm text-blue-600 — looks like a lifted tab inside the gray container