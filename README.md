# Life Simulator Frontend

This is the Next.js frontend for the Life Simulator game, converted from the original HTML/CSS/JS version.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` and configure the API base URL and other settings as needed.

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the game.

## Environment Variables

The application uses the following environment variables:

- `NEXT_PUBLIC_API_BASE_URL`: Backend API server URL (default: http://localhost:8084)
- `NEXT_PUBLIC_APP_NAME`: Application name for display
- `NEXT_PUBLIC_APP_VERSION`: Application version

## Static File Serving Toggle

The backend can be configured to disable static file serving by setting `SERVE_STATIC=false` in the backend's `.env` file. This allows you to run only the Next.js frontend while keeping the API endpoints active.

When static serving is disabled, accessing the backend root URL will return a JSON message instead of serving the static HTML files.

## Features

- Interactive life simulation game
- Character management
- Resource tracking (health, energy, money, etc.)
- Event system
- Fullscreen mode
- Responsive design
- Google OAuth authentication

## Build for Production

```bash
npm run build
npm run start
```

## Original HTML Version

The original HTML version is saved as `index.html.backup` in the root directory.