# Machine Listening - ready build

## Frontend
Deploy the root files to GitHub Pages.

Expected structure:
- index.html
- style.css
- main.js
- sketch.js
- network.js
- assets/audio/machine-listening.wav

If the WAV file is missing, the site still works with synthetic fallback audio.

## Backend
The `server/` folder is optional.

Use it only if you want a live distributed state shared between visitors through Render or another Node host.

## Render quick deploy
- Root directory: `server`
- Build command: `npm install`
- Start command: `npm start`

## GitHub Pages
GitHub Pages is for the static frontend only.
