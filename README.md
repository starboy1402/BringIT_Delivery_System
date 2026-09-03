# Delivery Request Dashboard UI

A comprehensive front-end web application for managing peer-to-peer campus delivery requests. Built with React, Tailwind CSS, and Supabase, it allows students to request deliveries, track request statuses, and interact in real-time.

## 🚀 Features

- **Authentication & User Profiles:** Secure JWT-based authentication using Supabase. Users must complete their profile equipped with a `student_id` before managing requests.
- **Delivery Requests:** Create, view, track, and manage peer-to-peer delivery requests. Includes nested detail views for request tracking.
- **Real-time Synchronization:** Built-in real-time webhook endpoints (`useRealtime` hooks) for real-time notifications and message exchange.
- **Leaderboard Gamification:** A leaderboard system to encourage participation and gamify the platform for frequent deliverers.
- **Customizable UI/UX:** Dark/Light theme switching mechanism, toast notifications, animated components, modally accessible data context menus.
- **Responsive Layout:** fully responsive mobile-first navigation systems via Tailwind CSS.

## 🛠 Tech Stack

- **Frontend Framework:** [React 19](https://react.dev/) + [React Router v7](https://reactrouter.com/) (Vite bundler)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) with `clsx` and `tailwind-merge`.
- **Database & Backend:** [Supabase](https://supabase.com/) (Postgres, Realtime, Auth, Storage).
- **Icons:** [Lucide React](https://lucide.dev/).

## 📁 Project Structure

```text
src/
├── components/     # Reusable UI components (Buttons, Cards, Navbar, Modals)
├── constants/      # App-wide fixed configurations and constants
├── contexts/       # React Context API files (Auth, Modal, Theme, Toast)
├── hooks/          # Custom hooks (e.g. useRealtime for Websocket connections)
├── lib/            # Backend integration, database handlers, Supabase setup
│   └── db/         # Module DB layers (users, requests, messages, themes, etc.)
├── pages/          # Full page views routed via React Router
└── utils/          # Utility functions (time formatting, errors, validation, Tailwind classes)
```

## ⚙️ Getting Started

### Prerequisites
- Node.js `v18+` or equivalent.
- A Supabase Project (Database configured to map with `src/lib/db/`).

### Setup

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd delivery-request-dashboard-ui
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env.local` file in the root directory mapping the necessary Supabase values:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Spin up the development server:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

## 🗄 Context & State Management

This project orchestrates local state via a custom context layer:
- **`AuthProvider`**: Manages current user sessions and profile sync with Supabase.
- **`ThemeProvider`**: Globally coordinates UI Dark/Light modes.
- **`ToastProvider`**: Mounts an asynchronous notification portal for in-app success/error statuses.
- **`ModalProvider`**: Manages popups, dialog boxes, and contextual menus.

## 📄 License
This project is licensed under the MIT License.
