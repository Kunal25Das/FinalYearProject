# Campus Connect 🎓

A comprehensive college organization web app built with Next.js, Appwrite, and modern animation libraries to help students organize their college life.

## ✨ Features

### Pre-Login

- **Landing Page**: Stunning landing page with animated spinning galaxy effect
- **Authentication**: Email/password and Google OAuth login/signup
- **Role Selection**: Choose account type (Student, Faculty, Club Admin, Event Organizer)

### Student Dashboard

- **📅 Schedule**: Calendar view with class tracking, rescheduling notifications, and cancellation alerts
- **📚 Classes**: View all enrolled classes, access resources, submit assignments, and view notices
- **🎯 Feed**: Stay updated with latest college happenings, events, and announcements
- **👥 Community**: Join clubs, view events, and participate in college activities
- **💰 Wallet**: Earn coins through participation, redeem in marketplace for goodies

### Upcoming Features

- **Club Admin Dashboard**: Create clubs, host events, manage registrations, award coins
- **Event Organizer Dashboard**: Host events, see registrations, assign roles
- **Faculty Dashboard**: Class management, resource sharing, attendance tracking
- **Faculty Admin (HOD) Dashboard**: Batch management, schedule uploads, faculty assignments
- **College Admin Dashboard**: Student data import, account approvals, super admin features
- **AI Features**: Smart recommendations, flashcard generation from PDFs
- **Class Inheritance**: Automatic resource transfer between batches

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (JavaScript)
- **Backend**: Appwrite (Cloud BaaS)
- **Styling**: Tailwind CSS 4
- **Animations**:
  - Framer Motion (component animations)
  - GSAP (galaxy animation)
  - Lenis (smooth scrolling)
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Code Quality**: ESLint, Prettier, Husky, Commitlint

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Appwrite account (free at [cloud.appwrite.io](https://cloud.appwrite.io))

### Installation

1. **Clone the repository** (or you're already in it!)

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Setup Appwrite**:
   - Create a new project at [cloud.appwrite.io](https://cloud.appwrite.io)
   - Create a new database
   - Create a storage bucket
   - Enable Google OAuth provider (optional)
   - Copy your project credentials

4. **Configure environment variables**:
   - Update `.env.local` with your Appwrite credentials:

   ```env
   NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_APPWRITE_DATABASE_ID=your-database-id
   NEXT_PUBLIC_APPWRITE_STORAGE_ID=your-storage-id
   ```

5. **Run the development server**:

   ```bash
   npm run dev
   ```

6. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
campus-connect/
├── src/
│   ├── app/                          # Next.js app directory
│   │   ├── auth/                     # Authentication pages
│   │   ├── dashboard/                # Dashboard pages
│   │   ├── globals.css
│   │   ├── layout.js
│   │   └── page.js
│   ├── components/                   # React components
│   │   ├── dashboard/
│   │   │   ├── student/              # Student-specific components
│   │   │   └── DashboardLayout.js
│   │   ├── ui/                       # Reusable UI components
│   │   ├── LandingPage.js
│   │   └── ThemeToggle.js
│   ├── contexts/                     # React contexts
│   │   ├── AuthContext.js            # Authentication state
│   │   └── ThemeContext.js           # Theme (dark/light mode)
│   └── lib/
│       └── appwrite.js               # Appwrite configuration
├── public/                           # Static assets
├── .env.local                        # Environment variables
└── package.json
```

## 🎨 Key Features

### Theme Support

- **Light Mode**: Clean, professional interface
- **Dark Mode**: Easy on the eyes for night studying
- Smooth transitions between themes

### Responsive Design

Fully responsive across all devices:

- Mobile (320px+)
- Tablet (768px+)
- Desktop (1024px+)

## 🚧 Coming Soon

- Faculty dashboards with class management
- Admin panels for college management
- AI-powered features (flashcard generation, smart recommendations)
- Real-time notifications
- Backend integration with Appwrite

## 📄 Development Notes

### Current Status: Frontend MVP

- ✅ Landing page with animations
- ✅ Authentication flows
- ✅ Student dashboard (complete)
- ✅ Theme switching
- ⏳ Other dashboards (in progress)
- ⏳ Backend integration (next phase)

---

Built with ❤️ using Next.js and Appwrite
