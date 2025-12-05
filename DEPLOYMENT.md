# Deploying to Railway

This project is configured as a Monolith (Frontend + Backend) for easy deployment on Railway.

## Prerequisites

1.  A [Railway](https://railway.app/) account.
2.  The [Railway CLI](https://docs.railway.app/guides/cli) (optional, but good for testing).
3.  Your database provisoned (e.g. Railway Postgres).

## Environment Variables

You must set the following environment variables in your Railway project settings:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `DATABASE_URL` | Connection string for your Postgres DB | `postgresql://user:pass@host:port/dbname` |
| `PGDATABASE` | Database name (sometimes auto-set) | `railway` |
| `PGHOST` | Database host | `containers-us-west-1.railway.app` |
| `PGPASSWORD` | Database password | `...` |
| `PGPORT` | Database port | `5432` |
| `PGUSER` | Database user | `postgres` |
| `OPENAI_API_KEY` | Key for OpenAI API | `sk-...` |
| `JWT_SECRET` | Secret for signing JWTs | `some-long-random-string` |
| `SESSION_SECRET` | Secret for session cookie signing | `another-long-random-string` |
| `NODE_ENV` | Set to `production` | `production` |
| `PORT` | The port the app listens on (Railway sets this) | `PORT` |
| `GEMINI_API_KEY` | Key for Google Gemini API | `AIza...` |

## Deployment Steps

1.  **Push to GitHub**: Ensure your latest code is on the `main` (or `master`) branch.
2.  **New Project in Railway**:
    *   Click "New Project" -> "Deploy from GitHub repo".
    *   Select your repository.
3.  **Add Database**:
    *   Right click on the project canvas -> "New" -> "Database" -> "PostgreSQL".
    *   Connect your app service to this database variable (Railway often does this automatically if you add the DB first, otherwise copy the `DATABASE_URL` from the DB service to your App service variables).
4.  **Configure Variables**: Add all the variables listed above in the "Variables" tab of your App service.
5.  **Build & Deploy**: Railway will automatically detect `package.json`, run `npm run build`, and then `npm start`.

## Migrations

The build script includes the migrations in the final artifact.
To run migrations, you can add a "Deploy Start Command" or run it manually via ephemeral shell, but the easiest is to add a custom start command or run it as a pre-start step.

**Recommended Start Command:**
```bash
node dist/migrate.cjs && node dist/index.cjs
```
This ensures migrations run before the app starts.
