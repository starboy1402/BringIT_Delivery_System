# Plan: Recreate the BringIT Campus Delivery UI in Lovable

Rebuild the BringIT (peer-to-peer campus delivery) app as a polished, modern UI using the TanStack Start template. **No backend yet** — all data comes from realistic in-app mock data so every screen is fully browsable. Lovable Cloud (auth, database, real-time) can be wired up later.

## Chosen Design Direction

**Gamified mission control / neo-brutalist bento dashboard.**

- High-contrast, boxy cards with thick dark borders and hard shadows.
- Emerald green as the primary action color against a near-white/slate-50 background.
- Space Grotesk for display headings, Inter for body text.
- Dense, modular layouts that feel like a courier dispatch console crossed with a campus notice board.
- Subtle gamification: ranks, points, streaks, and bold stat tiles.

## Design Tokens (src/styles.css)

- Background: `oklch(0.98 0 0)` (slate-50)
- Card: `oklch(1 0 0)` (white)
- Foreground: `oklch(0.15 0 0)` (near black)
- Primary: `oklch(0.62 0.19 150)` (emerald)
- Primary foreground: white
- Secondary: `oklch(0.95 0 0)`
- Muted: `oklch(0.94 0 0)`
- Border: `oklch(0.15 0 0)` (thick dark borders)
- Destructive: `oklch(0.55 0.22 25)`
- Radius: `1rem` for cards, `0.75rem` for buttons
- Shadows: hard offset shadows using `box-shadow: 6px 6px 0 0 var(--foreground)` on cards and primary buttons

## Typography

- Display / headings: **Space Grotesk** (Google Fonts, loaded in `__root.tsx`)
- Body / UI: **Inter**
- Headings: bold, tight tracking (`tracking-tight`)
- Labels: uppercase, wide tracking, small size, bold weight

## Global Components

### App Shell
- Top navbar: logo "BringIT" in Space Grotesk, nav links (Feed, My Requests, Messages, Leaderboard), theme toggle, notification bell, avatar.
- Mobile: bottom tab bar with icons + labels.
- Page max-width container centered with generous padding.

### Card Primitive
- White background, `border-2 border-foreground`, rounded-2xl, hard shadow `6px 6px 0 0 #0f172a` (light) / offset shadow inverts for dark mode.
- Hover: lift up/left by 2px and shadow reduces, giving a pressed-then-released feel.

### Button Variants
- **Primary**: emerald fill, white text, dark border-2, hard shadow, active scale.
- **Secondary**: white fill, dark border-2, hard shadow.
- **Ghost**: underline on hover.

### Status Badge
- `open` — emerald outline
- `accepted` — amber outline
- `in-transit` — blue outline with pulse
- `delivered` — slate filled
- `cancelled` — destructive outline

### Empty States
- Illustration placeholder + bold headline + subtext + CTA button.

## Pages & Routes

| Route | Page | Contents |
|---|---|---|
| `/` | Landing | Hero with big display type + CTA, feature category cards, live stats bento, leaderboard teaser, how-it-works steps, footer |
| `/auth` | Auth | Centered card with tabs: Sign In / Sign Up; student email + password fields |
| `/complete-profile` | Complete Profile | Form: full name, student ID, hall/room, phone, avatar preview |
| `/feed` | Request Feed | Filter bar (category, pickup, reward range), grid of request cards, pagination/load-more |
| `/requests/new` | Create Request | Two-column form: item details, pickup/dropoff, reward, urgency toggle |
| `/requests/$id` | Request Detail | Two-column: request summary card + status timeline; requester/deliverer cards; chat thread |
| `/my-requests` | My Requests | Tabs "Posted" / "Delivering" / "History"; status badges and quick actions |
| `/messages` | Messaging | Split view: conversation list + active chat with bubbles |
| `/leaderboard` | Leaderboard | Ranked list with podium top-3, points, delivery count, streak |
| `/profile` | Profile | User card, stats grid, recent deliveries, edit profile button |

## Mock Data

- 10–12 delivery requests across statuses with CUET-realistic routes (e.g. GEC Circle → South Hall, New Market → Shah Hall).
- 8 sample users with student IDs, hall names, avatars, points, ranks.
- 4 sample conversations between requesters and deliverers.
- 6 sample notifications.
- Client-side React context store so actions like "Accept" update local state during the session.

## Key Interactions

- Accept request → card moves from feed to "My Requests / Delivering".
- Mark delivered → status updates, points increment.
- Send message → new bubble appears locally.
- Theme toggle → light/dark class swap with persisted preference.
- Filter feed → instant client-side filtering of mock requests.

## Technical Notes

- TanStack Router file-based routes; every nav link gets a route file in the same pass.
- Tailwind v4 tokens in `src/styles.css`; fonts loaded via `<link>` in `__root.tsx`.
- Lucide icons; no backend calls anywhere — swapping in Lovable Cloud later only replaces the mock data layer.
- SEO metadata (title, description, og, twitter) per route; no placeholder "Lovable App" text.
