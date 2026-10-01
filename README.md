# Astro Web

Astro Web is a React and TypeScript application built with Vite.

## Local development

```sh
npm ci
npm run dev
```

For API and Google sign-in features, create a local `.env` file with:

```dotenv
VITE_API_URL=https://your-api.example.com
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id
```

These are public frontend configuration values, not secrets. Never put private API credentials in `VITE_*` variables.

## GitHub Pages deployment

The `Deploy to GitHub Pages` workflow publishes this repository at `https://ngriskauskas.github.io/astro-web/` when changes are pushed to `main`. In the repository's **Settings > Pages**, set the build and deployment source to **GitHub Actions**.

Add the following repository Actions variables under **Settings > Secrets and variables > Actions > Variables**:

- `VITE_API_URL`: the HTTPS base URL for the API, without a trailing slash.
- `VITE_GOOGLE_CLIENT_ID`: the Google OAuth web client ID.

The API must be deployed separately, allow the Pages origin through CORS, and enforce authentication and authorization server-side. Configure the Google OAuth client to allow the Pages origin. A static frontend cannot keep secrets or replace backend security controls.

GitHub Pages serves the built app as a static site. The deployment includes a `404.html` fallback for client-side routes.
