# BidNoroff — Student auction platform

A single-page auction web application where Noroff students can list items, place bids, and manage their profiles. Built with Vanilla JavaScript and the Noroff API v2.

---

## Screenshot

![BidNoroff Home Page](./public/App_screenshot.png)

---

## Links

- **Live Site:** [marina-kovaleva-sp-2-jan-25-ft.vercel.app](https://marina-kovaleva-sp-2-jan-25-ft.vercel.app/)
- **Repository:** [github.com/M-Kovaleva/Marina-Kovaleva-SP2-JAN25FT](https://github.com/M-Kovaleva/Marina-Kovaleva-SP2-JAN25FT)
- **Figma:** *[Figma style and design](https://www.figma.com/design/egDQFbEKpnZmI5OqO7PONM/Marina-Kovaleva-SP2-JAN25FT?node-id=7-125&t=oDsdiXNGvIbP3VXp-1)*
- **Kanban Board:** [GitHub Projects](https://github.com/users/M-Kovaleva/projects/16)

---

## Tech Stack
- Vite 
- Vanilla JavaScript
- Tailwind CSS v4
- ESLint + Prettier
- Noroff API v2
- Vercel (hosting)

---

## Pages

| Page | Route |
|------|-------|
| Home / Feed | `/` |
| Listing Detail | `/listing/:id` |
| Create Listing | `/listing/create` |
| Edit Listing | `/listing/:id/edit` |
| Profile | `/profile/:name` |
| Login | `/login` |
| Register | `/register` |
| 404 | any unknown route |

---

## Features
- Browse and search listings without an account
- Register with a `@stud.noroff.no` email
- Login / Logout
- Create, edit and delete listings (title, description, images, deadline)
- Place bids on other users' listings
- Live countdown timer on each listing
- View oter user's profiles with their listings
- Edit profile (bio, avatar, banner)
- View your listings, bids placed, and auctions won
- Credits balance visible at all times when logged in
- Fully responsive — desktop and mobile

## Known Issues
- Bid history and current bid amount are not updated in real-time while the page is open; the user must refresh to see new bids from other users
- Visual differences between Safari and Chrome/Firefox - known compatibility issue between Tailwind v4 and Safari
- The browser Back button from the Edit Profile modal navigates to the previous page in history rather than closing the modal — this is standard SPA behaviour, but may be unexpected for some users
- 
---

## Future Improvements
- Filter by categories
- Bid History Pagination - add pagination or infinite scroll to bid history on popular listings with many bids
- Implement image lazy loading across all listing cards to improve initial page load time
- Investigate compatibility with Tailwind v4 with Safari

---

### Architecture
```
src/js/
├── api/          — API client (all Noroff API calls)
├── auth/         — Login, Register, storage, user sync
├── components/   — Nav, ListingCard, LoginRequiredModal
├── handlers/     — Page logic (hero, listings, listing detail, bid form, profile, forms)
├── router/       — Client-side SPA router
├── utils/        — Shared utilities (format, time, formState, avatar, listing)
└── views/        — HTML templates + lifecycle (render / init / destroy)
```

---

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/M-Kovaleva/Marina-Kovaleva-SP2-JAN25FT.git
   ```
 
2. Navigate to the project:
   ```bash
   cd Marina-Kovaleva-SP2-JAN25FT
   ```
 
3. Install dependencies:
   ```bash
   npm install
   ```
 
4. Create a `.env` file in the root:
   ```
   VITE_API_BASE=https://v2.api.noroff.dev/v2
   VITE_API_KEY=your_api_key_here
   ```
 
5. Start the development server:
   ```bash
   npm run dev
   ```
 
6. Build for production:
   ```bash
   npm run build
   ```
 
---

## Environment Variables
 
| Variable | Description |
|----------|-------------|
| `VITE_API_BASE` | Noroff API base URL |
| `VITE_API_KEY` | Your Noroff API key |
 
---

## License
This project was created for educational purposes at Noroff.

---

## Contact
Marina Kovaleva - owlet.savvina@gmail.com
