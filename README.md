# 🎓 Murshid (مرشد)
**The Intelligent Academic Advising Platform for Al-Zaytoonah University of Jordan**

![Murshid Platform](https://img.shields.io/badge/Status-Active-success.svg) ![License](https://img.shields.io/badge/License-MIT-blue.svg) ![React](https://img.shields.io/badge/React-19-61dafb.svg) ![Tailwind](https://img.shields.io/badge/Tailwind-4-38b2ac.svg)

**Murshid** is a state-of-the-art web application designed to streamline academic advising at Al-Zaytoonah University of Jordan. It empowers students with AI-driven insights, study plans, and graduation tracking, while providing administrators and advisors with powerful oversight tools.

---

## ✨ Key Features

### 🤖 AI-Powered Academic Assistant
- **Gemini-Style Chat Interface:** A sleek, edge-to-edge chat experience with a frosted-glass floating input.
- **Smart Routing:** An advanced supervisor prompt categorizes queries (Registration, Finance, QA) before processing.
- **Feedback System:** Built-in thumbs-up/thumbs-down functionality to continuously improve AI responses.
- **Persistent Memory:** Chat history is saved and loads seamlessly across sessions.

### 🌍 Full Bilingual Support (English / Arabic)
- Complete Right-to-Left (RTL) support for the Arabic language.
- Dynamic layout mirroring using modern CSS logical properties (`start`, `end`, `ms`, `pe`).
- Instant language switching without reloading the application.

### 📊 Student Dashboard
- **Academic Overview:** Real-time tracking of GPA, Completed Hours, and Current Semester.
- **Graduation Progress:** Visual progress bars indicating remaining semesters and credit requirements.
- **Course Management:** View currently enrolled courses, past grades, and AI-recommended courses based on academic history.

### 🔐 Secure University Authentication
- Strict email validation ensuring only official `@zuj.edu.jo` and `@std-zuj.edu.jo` emails can register.
- OTP (One-Time Password) email verification powered by **Resend**.
- Secure session management and password hashing.

### 🛠️ Admin / Advisor Portal
- Read-only administrative access to monitor student progress.
- Ability to assign advisors to students.
- Broadcast announcements and notifications to the student body.

---

## 🏗️ Technology Stack

| Category | Technology |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS 4, Framer Motion, shadcn/ui |
| **Backend** | Node.js, Express 4, tRPC 11 |
| **Database** | MySQL (Google Cloud SQL), Drizzle ORM |
| **AI Integration** | LLaMA 3 (hosted via Runpod) |
| **Email Service** | Resend API |

---

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or newer)
- [pnpm](https://pnpm.io/) package manager
- A MySQL database instance

### Environment Variables
Create a `.env` file in the root directory and configure the following variables:

```env
# Database Configuration
DATABASE_URL='mysql://<user>:<password>@<host>:<port>/<dbname>?ssl={"rejectUnauthorized":false}'

# Authentication Secret
JWT_SECRET=your-secret-key-change-in-production

# Runpod AI Server
RUNPOD_API_URL=https://<your-runpod-id>.proxy.runpod.net/

# Resend Custom Email System
RESEND_API_KEY=re_your_api_key_here

# Server Settings
NODE_ENV=development
PORT=3000
```

### Installation

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Push database schema:**
   Sync the Drizzle ORM schema with your MySQL database.
   ```bash
   pnpm db:push
   ```

3. **Start the development server:**
   ```bash
   pnpm dev
   ```
   The application will be available at `http://localhost:3000`.

---

## 🗄️ Database Management
To view and manage your database via a web interface, use Drizzle Studio:
```bash
npx drizzle-kit studio
```
This will open a local web portal at `https://local.drizzle.studio`.

---

## 📂 Project Structure

```text
murshid/
├── client/                 # Frontend React Application
│   ├── src/
│   │   ├── components/     # Reusable UI components (shadcn, AIChatBox, etc.)
│   │   ├── pages/          # Full page views (StudentDashboard, AIChatPage, etc.)
│   │   ├── contexts/       # React Contexts (I18n, Auth)
│   │   └── lib/            # tRPC client setup
├── server/                 # Backend Express Application
│   ├── routers/            # tRPC Routers (auth, aiChat, student, etc.)
│   ├── utils/              # Server utilities (email sender)
│   └── _core/              # Framework plumbing (LLM, Auth Security)
├── drizzle/                # Database schema and migrations
│   └── schema.ts           # Definition of users, courses, chatMessages, etc.
└── shared/                 # Shared TypeScript types between client and server
```

---

## 🎨 Design Philosophy
Murshid is built with a premium, responsive design language:
- **Glassmorphism Elements:** Frosted glass panels used in the chat interface and floating elements.
- **Dynamic Micro-animations:** Powered by Framer Motion for smooth page transitions, stagger effects, and interactive button feedback.
- **Color Palette:** A professional blend of deep slates, vibrant cyans, and reliable blues to inspire academic trust and modernity.

---

*Built for Al-Zaytoonah University of Jordan. Empowering academic success through intelligent software.*
