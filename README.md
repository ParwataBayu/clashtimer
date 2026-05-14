# Next.js

A modern Next.js 15 application built with TypeScript and Tailwind CSS.

## 🚀 Features

- **Next.js 15** - Latest version with improved performance and features
- **React 19** - Latest React version with enhanced capabilities
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development

## 🛠️ Installation

1. Install dependencies:
  ```bash
  npm install
  # or
  yarn install
  ```

2. Start the development server:
  ```bash
  npm run dev
  # or
  yarn dev
  ```
3. Open [http://localhost:4028](http://localhost:4028) with your browser to see the result.

## 📁 Project Structure

```
nextjs/
├── public/             # Static assets
├── src/
│   ├── app/            # App router components
│   │   ├── layout.tsx  # Root layout component
│   │   └── page.tsx    # Main page component
│   ├── components/     # Reusable UI components
│   ├── styles/         # Global styles and Tailwind configuration
├── next.config.mjs     # Next.js configuration
├── package.json        # Project dependencies and scripts
├── postcss.config.js   # PostCSS configuration
└── tailwind.config.js  # Tailwind CSS configuration

```

## 🧩 Page Editing

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

## 🎨 Styling

This project uses Tailwind CSS for styling with the following features:
- Utility-first approach for rapid development
- Custom theme configuration
- Responsive design utilities
- PostCSS and Autoprefixer integration

## 📦 Available Scripts

- `npm run dev` - Start development server on port 4028
- `npm run build` - Build the application for production
- `npm run start` - Start the development server
- `npm run serve` - Start the production server
- `npm run lint` - Run ESLint to check code quality
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format code with Prettier

## 📱 Deployment

Build the application for production:

  ```bash
  npm run build
  ```

## 📚 Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial

You can check out the [Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## 🙏 Acknowledgments

- Built with [Rocket.new](https://rocket.new)
- Powered by Next.js and React
- Styled with Tailwind CSS

Built with ❤️ on Rocket.new

## 🚀 Deployment to Vercel

- **Environment variables (required)**:
  - `TELEGRAM_BOT_TOKEN` — token bot Telegram (dari @BotFather).
  - `TELEGRAM_CHAT_ID` — chat id atau id user yang menerima notifikasi.

- **Optional (for persistent database across devices)**:
  - `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` — if you want serverless persistence with Supabase. The current app stores data in `localStorage` by default; enabling Supabase persistence is implemented in `src/lib/store.ts` and will sync to Supabase when these variables are present.

  - Required Supabase tables (SQL):

```sql
-- accounts table
create table if not exists accounts (
  id text primary key,
  name text,
  thLevel int,
  dotColor text
);

-- timers table
create table if not exists timers (
  id text primary key,
  accountId text references accounts(id),
  accountName text,
  type text,
  name text,
  finishAt bigint,
  screenshotUrl text,
  status text
);
```

  Make sure to run the SQL in the Supabase SQL editor or create equivalent tables via the dashboard.

- **Deploy steps (quick)**:
  1. Push your repo to Git provider (GitHub/GitLab) and connect the repository to Vercel, or use the Vercel CLI:

```bash
# install vercel CLI (optional)
npm install -g vercel

# run the interactive deploy
vercel
```

  2. In the Vercel Dashboard, open your Project → Settings → Environment Variables and add `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, and `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` (if using Supabase). Use the `Preview`/`Production` scopes as appropriate.

  - Additionally, to run a server-side scheduler (recommended) add these env vars in Vercel:
    - `SUPABASE_SERVICE_ROLE_KEY` — Supabase service_role key (keep secret).
    - `CRON_SECRET` — optional secret to protect the cron endpoint (any string).

  3. Trigger a deploy from Vercel (push to main or click Deploy).

- **Local development**:
 
**Server-side scheduler (Vercel cron)**

Optionally configure a Vercel Cron Job to call the server endpoint that checks due timers and sends notifications even when clients are offline.

- Endpoint: `https://<your-vercel-domain>/api/cron/check-timers`
- Method: `GET`
- If you set `CRON_SECRET`, add header `x-cron-secret` with its value in the cron job configuration.

This endpoint will mark due timers `done` in Supabase and send Telegram notifications server-side.

To enable, set `SUPABASE_SERVICE_ROLE_KEY` in Vercel and add a Cron job (example every minute).

Example Vercel Cron configuration:

- Schedule: every 1 minute (or choose your desired cadence)
- URL: `/api/cron/check-timers`
- Method: `GET`
- Headers (optional): `x-cron-secret: <your CRON_SECRET>`

Note: The service role key must be kept secret — put it in Vercel Environment Variables with scope `Production` and `Preview` as needed.


Create a `.env.local` file at project root with the variables for testing:

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=123456789
# Optional for Supabase persistence (see notes above)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=public-anon-key
```

- **Telegram notes**:
  - Make sure your bot can send messages to the target chat (start a conversation with the bot or add it to the group).
  - If you use a group, the `TELEGRAM_CHAT_ID` may be negative (e.g. -1001234567890).

- **If you want me to implement Supabase persistence**: I can update `src/lib/store.ts` and add a lightweight Supabase client (`src/lib/supabaseClient.ts`) so account/timer state syncs to the database and remains compatible with Vercel serverless deployment. Tell me if you want me to proceed and whether you prefer Supabase or Vercel Postgres.
