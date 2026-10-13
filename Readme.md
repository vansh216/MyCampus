# MyCampus: Your Event Journey

MyCampus brings a student's whole event life into one organized, intelligent timeline.

Students register for hackathons, competitions, workshops and conferences across many platforms. Registrations, deadlines, venues and round schedules end up scattered over emails, WhatsApp groups, posters and portals. MyCampus collects all of it in one place, so nothing is missed and nothing clashes.

## What it does

- Adds an event from a **poster or screenshot**, **pasted text or link**, or a **manual form**.
- Uses AI to read the input and fill in the event name, dates, venue, deadlines, rounds and registration link.
- Shows every event on a single **timeline** with calendar and list views, including each round (Screening, Round 2, Finale).
- Warns when two events or deadlines **clash**.
- Tracks the **status** of each event: Registered, Submitted, Shortlisted, Rejected, Completed.
- Shows an **event journey** view, a visual path from registration to result.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React, Tailwind CSS |
| Backend | Node.js, Express |
| Database | PostgreSQL with Prisma ORM |
| AI | OpenRouter API |

## Folder structure

```
mycampus/
├── README.md
├── .gitignore
├── client/                     # React + Tailwind frontend
│   ├── public/
│   ├── src/
│   │   ├── api/                # functions that call the backend
│   │   ├── components/         # reusable UI pieces (cards, forms, modals)
│   │   ├── pages/              # Dashboard, AddEvent, Timeline, EventJourney
│   │   ├── hooks/              # custom React hooks
│   │   ├── utils/              # date helpers, conflict display helpers
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css           # Tailwind directives
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
└── server/                     # Node + Express backend
    ├── prisma/
    │   └── schema.prisma       # database models
    ├── src/
    │   ├── config/             # environment and app configuration
    │   ├── controllers/        # request handlers
    │   ├── middleware/         # file upload, error handling
    │   ├── routes/             # API route definitions
    │   ├── services/
    │   │   ├── ai.service.js       # OpenRouter calls and extraction prompts
    │   │   └── conflict.service.js # date and time overlap detection
    │   ├── utils/
    │   ├── app.js              # Express app setup
    │   └── server.js           # entry point
    ├── uploads/                # uploaded posters (git-ignored)
    ├── .env.example
    └── package.json
```

## Prerequisites

- Node.js 18 or newer
- npm
- PostgreSQL 14 or newer, running locally or hosted
- An OpenRouter API key from https://openrouter.ai/keys

## Setup

### 1. Clone the project

```bash
git clone <your-repo-url> mycampus
cd mycampus
```

### 2. Set up the backend

```bash
cd server
npm install
cp .env.example .env
```

Open `server/.env` and fill in the values:

```env
PORT=5000
CLIENT_URL=http://localhost:5173
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/mycampus"
OPENROUTER_API_KEY=your_openrouter_key
OPENROUTER_MODEL=your_chosen_model_id
```

Create the database tables and generate the Prisma client:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

Start the server:

```bash
npm run dev
```

The API runs at `http://localhost:5000`.

### 3. Set up the frontend

Open a second terminal:

```bash
cd client
npm install
cp .env.example .env
```

Open `client/.env`:

```env
VITE_API_URL=http://localhost:5000
```

Start the app:

```bash
npm run dev
```

The app runs at `http://localhost:5173`.

## Environment variables

| Variable | Where | Description |
|---|---|---|
| `PORT` | server | Port the Express server listens on |
| `CLIENT_URL` | server | Frontend URL, used for CORS |
| `DATABASE_URL` | server | PostgreSQL connection string used by Prisma |
| `OPENROUTER_API_KEY` | server | Your OpenRouter API key. Keep it only on the server |
| `OPENROUTER_MODEL` | server | Model ID used for text and poster extraction. Poster upload needs a model that accepts images |
| `VITE_API_URL` | client | Base URL of the backend API |

## Useful commands

| Command | Folder | What it does |
|---|---|---|
| `npm run dev` | client, server | Starts the development server |
| `npx prisma studio` | server | Opens a browser view of the database |
| `npx prisma migrate dev` | server | Applies schema changes to the database |
| `npm run build` | client | Builds the frontend for production |

## Troubleshooting

- **Cannot connect to the database:** check that PostgreSQL is running and that `DATABASE_URL` has the right user, password and database name.
- **CORS error in the browser:** make sure `CLIENT_URL` in `server/.env` matches the address the frontend runs on.
- **AI extraction fails or is slow:** check the OpenRouter key and model ID. Some free models are slow, so the manual form is always available as a fallback.
- **Poster upload returns an empty result:** the selected model may not support images. Choose a vision-capable model in `OPENROUTER_MODEL`.

## Security notes

- Never commit `.env` files. Only the `.env.example` files belong in the repository.
- The OpenRouter key stays on the server and is never exposed to the browser.