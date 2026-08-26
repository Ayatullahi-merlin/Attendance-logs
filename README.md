# Trainer Attendance Tracker

[![React](https://img.shields.io/badge/React-18.3-blue.svg?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-JS_v2-3ECF8E.svg?logo=supabase)](https://supabase.com/)
[![Vite](https://img.shields.io/badge/Vite-6.1-646CFF.svg?logo=vite)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A lightweight, high-performance, and responsive React application for tracking trainer attendance, managing check-in/out approvals, and exporting records in Microsoft Excel (`.xlsx`) format.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Security & Git Commit Guidelines](#-security--git-commit-guidelines)
- [Supabase Database Setup](#-supabase-database-setup)
- [Project Architecture](#-project-architecture)
- [Environment Setup](#-environment-setup)
- [Getting Started](#-getting-started)
- [Admin Access & Passcode](#-admin-access--passcode)
- [Scripts Reference](#-scripts-reference)

---

## ✨ Features

- **Trainer Portal (`/`)**:
  - Centered card layout with custom logo header placeholder (`<img id="company-logo">`).
  - Input field for Trainer Name with Check In (Solid Navy Blue) and Check Out (Navy Blue border) buttons.
  - Submits check-ins as `status: 'pending'` for admin review with user feedback alerts.

- **Admin Dashboard (`/admin`)**:
  - Protected by passcode authentication modal (`admin123`).
  - View live attendance logs ordered by `created_at DESC`.
  - **Accept / Reject Approval Workflow**: Admins accept or reject pending trainer requests.
  - **Status Filter & Search**: Filter logs by trainer name or approval status (`All`, `Pending`, `Approved`, `Rejected`).
  - **Native Excel Export**: Single-click export of filtered records to `.xlsx` spreadsheet format.

- **React Router Navigation**:
  - Full client-side routing via `react-router-dom` (`/` and `/admin`).
  - Session storage persistence for seamless page reloads on subroutes.

---

## 🛠️ Tech Stack

| Component | Technology | Description |
|---|---|---|
| **Frontend Framework** | React 18 (Vite) | Fast, component-based UI rendering |
| **Routing** | React Router v6 | Single Page Application client routing |
| **Styling** | Tailwind CSS v3 | Utility-first responsive design system |
| **Database & API** | `@supabase/supabase-js` | PostgreSQL backend-as-a-service |
| **Data Export** | `xlsx` (SheetJS) | Native Excel `.xlsx` spreadsheet generation |
| **Icons** | `lucide-react` | Modern, accessible SVG icon set |

---

## 🛡️ Security & Git Commit Guidelines

> [!CAUTION]
> **CRITICAL SECURITY REQUIREMENT**
> Never push secret API keys, private credentials, or environment files to version control repositories.

### Files Excluded from Git (`.gitignore`)

The following files **MUST NOT** be committed to Git:

| File / Pattern | Reason for Exclusion |
|---|---|
| `.env` | Contains local API keys and environment variables |
| `.env.local` / `.env.*` | Local development environment overrides |
| `node_modules/` | External package dependencies directory |
| `dist/` / `build/` | Production build output bundles |
| `*.log` | Runtime debug logs |

### Safe Key Management Workflow

1. Keep public templates in repository using **`.env.example`** with placeholder variables:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```
2. Store your local keys strictly in **`.env`** (which is ignored by Git in `.gitignore`).

---

## 🗄️ Supabase Database Setup

Execute the following SQL script in your **Supabase SQL Editor** (`https://supabase.com/dashboard/project/<your-project-id>/sql`):

```sql
-- 1. Create attendance_logs table
create table if not exists attendance_logs (
  id uuid default gen_random_uuid() primary key,
  trainer_name text not null,
  action_type text not null check (action_type in ('check-in', 'check-out')),
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Ensure status column exists if updating existing table
alter table attendance_logs 
add column if not exists status text default 'pending';

-- 3. Enable Row Level Security (RLS)
alter table attendance_logs enable row level security;

-- 4. Create RLS Policies for public insertion, selection, and admin status updates
create policy "Allow public insert" on attendance_logs for insert with check (true);
create policy "Allow public select" on attendance_logs for select using (true);
create policy "Allow public update" on attendance_logs for update using (true);
```

---

## 📁 Project Architecture

```
Attendance logs/
├── .env                  # Local Environment Variables (GIT IGNORED)
├── .env.example          # Safe Public Environment Template
├── .gitignore            # Git exclusion definitions
├── index.html            # Application entry HTML
├── package.json          # Dependency specifications & scripts
├── postcss.config.js     # PostCSS configuration
├── tailwind.config.js    # Tailwind CSS theme extensions
├── vite.config.js        # Vite bundler options
└── src/
    ├── main.jsx          # React DOM mounting & BrowserRouter wrapper
    ├── App.jsx           # React Router routes & persistent state
    ├── index.css         # Tailwind CSS imports & base styles
    ├── supabaseClient.js # Supabase client initialization
    └── components/
        ├── Header.jsx          # Header with logo placeholder & route navigation
        ├── AdminAuthModal.jsx  # Admin passcode protection modal
        ├── TrainerPortal.jsx   # Trainer Check-in/out form component
        └── AdminDashboard.jsx  # Attendance table, approval workflow & Excel export
```

---

## ⚙️ Environment Setup

1. Copy `.env.example` to create your local `.env` file:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and fill in your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://mpozrtqkobyaopqbnlrf.supabase.co
   VITE_SUPABASE_ANON_KEY=your_actual_supabase_anon_key_here
   ```

---

## 🔑 Admin Access & Passcode

- **Default Admin Passcode**: `admin123`
- To access the Admin Dashboard, click **Admin Dashboard** in the top navigation bar and enter `admin123` when prompted.
- Click **Lock Admin** in the header to re-lock access when finished.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Local Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Build for Production
```bash
npm run build
```

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for details.
