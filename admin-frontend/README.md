# Admin Portal – Book Stall Reservation System

This is the **Admin/Employee Web Portal** of the **Colombo International Book Fair Reservation Management System**.

Admins can:
- Log in securely using email & password
- View all stall reservations
- Approve / Reject bookings
- Manage stall availability
- Logout securely

This portal is developed as a **separate frontend application** to clearly separate employee workflows from the publisher/vendor functionalities.

---

## 🏗️ Tech Stack

| Area | Technology |
|------|------------|
| Frontend Framework | React + TypeScript |
| Build Tool | Vite |
| Styling | TailwindCSS (optional) |
| API Calls | Axios |
| Authentication | JWT (via backend) |

---

## 📂 Project Structure

src/
 ├── assets/                # images, logos, icons
 ├── components/            # reusable UI components
 │    ├── Navbar.tsx
 │    ├── Sidebar.tsx
 │    ├── ReservationTable.tsx
 │    └── Loader.tsx
 ├── pages/                 # page-level views
 │    ├── LoginPage.tsx
 │    └── DashboardPage.tsx
 ├── routes/                # app routing
 │    └── AppRoutes.tsx
 ├── services/              # API and helpers
 │    ├── api.ts
 │    └── auth.ts
 ├── App.tsx
 ├── main.tsx
 └── index.css

