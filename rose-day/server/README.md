# Photo auth API

Protects the "Our Moments" photos behind a cookie-based password.

## Run

From project root:

1. **Install deps:** `npm install`
2. **Start the API:** `npm run server` (runs on port 3001)
3. **Start the app:** `npm run dev` (Vite proxies `/api` to the server)

Run both in separate terminals so that unlock and image serving work.

## Password

- Set env `PHOTO_PASSWORD` or edit default in `server/index.js` (default: `rose`).

## Protected images

- Add photos (e.g. `cafe1.jpg`, `cafe2.jpg`) into **`server/images/`**.
- They are only served when the client has the `photo-auth` cookie (after correct unlock).
- Update the `PHOTOS` array in `src/components/PhotoLockSection.tsx` if you use different filenames or captions.
