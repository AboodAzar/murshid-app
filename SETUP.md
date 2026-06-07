# Murshid - AI Academic Guidance Platform Setup Guide

## Overview

Murshid is a comprehensive AI-powered academic guidance platform built with React, Express, and MySQL. It provides role-based dashboards for students, academic advisors, and administrators, along with an intelligent AI chatbot for academic support.

## Features

### Core Features

- **Bilingual Support**: Full Arabic/English interface with automatic RTL/LTR switching
- **Role-Based Access**: Separate dashboards for Students, Advisors, and Administrators
- **AI Chatbot**: RAG-based FAQ answering system with conversation history
- **Course Recommendations**: Smart course suggestions based on GPA and prerequisites
- **Campus Navigation**: Interactive map with building and classroom search
- **Real-Time Notifications**: In-app notification system for all users
- **Document Management**: Advisors can upload documents to train the AI knowledge base

### Technology Stack

- **Frontend**: React 19, Tailwind CSS 4, Framer Motion
- **Backend**: Express 4, tRPC 11, Node.js
- **Database**: MySQL/TiDB with Drizzle ORM
- **Authentication**: Manus OAuth with JWT sessions
- **Storage**: AWS S3 integration for file storage
- **AI Integration**: LLM API for intelligent responses

## Prerequisites

- Node.js 22.13.0+
- pnpm 10.4.1+
- MySQL 8.0+ or TiDB
- Environment variables configured

## Installation

### 1. Install Dependencies

```bash
cd /home/ubuntu/murshid
pnpm install
```

### 2. Database Setup

Generate and apply migrations:

```bash
pnpm db:push
```

### 3. Seed Initial Data

Populate the database with departments, courses, buildings, and FAQs:

```bash
pnpm db:seed
```

### 4. Environment Variables

Ensure the following environment variables are set (automatically provided by Manus):

```
DATABASE_URL=mysql://user:password@host/database
JWT_SECRET=your-secret-key
VITE_APP_ID=your-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
BUILT_IN_FORGE_API_KEY=your-api-key
BUILT_IN_FORGE_API_URL=https://api.manus.im
```

## Running the Application

### Development Mode

```bash
pnpm dev
```

The application will start on `http://localhost:3000`

### Production Build

```bash
pnpm build
pnpm start
```

## Project Structure

```
murshid/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # React contexts (i18n, theme)
│   │   ├── hooks/         # Custom hooks
│   │   ├── locales/       # i18n translation files
│   │   └── App.tsx        # Main app component
│   └── index.html         # HTML entry point
├── server/                 # Express backend
│   ├── routers/           # tRPC procedure routers
│   ├── db.ts              # Database helpers
│   ├── storage.ts         # S3 storage helpers
│   └── _core/             # Core infrastructure
├── drizzle/               # Database schema and migrations
├── scripts/               # Utility scripts
└── package.json           # Dependencies and scripts
```

## API Routes

All API routes are under `/api/trpc` and use tRPC for type-safe communication.

### Authentication

- `auth.me` - Get current user profile
- `auth.logout` - Logout current user
- `auth.updateProfile` - Update user profile
- `auth.setLanguage` - Set user language preference

### Courses

- `courses.list` - List all courses
- `courses.getRecommendations` - Get personalized course recommendations
- `courses.enroll` - Enroll in a course
- `courses.getEnrolled` - Get enrolled courses

### AI Chat

- `aiChat.listConversations` - List chat conversations
- `aiChat.getMessages` - Get messages from a conversation
- `aiChat.sendMessage` - Send a message to the AI

### FAQs

- `faqs.list` - List FAQs (public)
- `faqs.create` - Create FAQ (advisor only)
- `faqs.update` - Update FAQ (advisor only)
- `faqs.delete` - Delete FAQ (advisor only)

### Notifications

- `notifications.list` - List user notifications
- `notifications.markAsRead` - Mark notification as read
- `notifications.delete` - Delete notification

### Documents

- `documents.list` - List uploaded documents (advisor only)
- `documents.upload` - Upload document (advisor only)
- `documents.delete` - Delete document (advisor only)

## User Roles

### Student

- View personal GPA and academic progress
- Enroll in courses
- Receive course recommendations
- Chat with AI academic assistant
- View campus navigation
- Receive notifications

### Academic Advisor

- Manage FAQs and knowledge base
- Upload documents for AI training
- Review student conversations with AI
- Manage student study plans
- View student analytics

### Administrator

- Manage all users and roles
- Manage departments and courses
- View system analytics
- Configure system settings
- Monitor AI usage statistics

## Bilingual Support

The platform automatically detects and switches between Arabic and English:

- **Language Toggle**: Available in the top navigation
- **RTL/LTR**: Automatically applied based on language
- **Persistence**: Language preference is saved to localStorage
- **Translations**: All UI text is managed via i18n JSON files

### Adding New Translations

1. Edit `client/src/locales/en.json` and `client/src/locales/ar.json`
2. Use the i18n hook in components:

```tsx
import { useI18n } from "@/contexts/I18nContext";

export default function MyComponent() {
  const { t } = useI18n();
  return <h1>{t("myKey")}</h1>;
}
```

## Testing

Run the test suite:

```bash
pnpm test
```

## Deployment

### Using Manus Platform

1. Create a checkpoint in the Management UI
2. Click the "Publish" button
3. Configure custom domain if needed
4. Application will be deployed automatically

### Manual Deployment

The application can be deployed to any Node.js hosting platform (Railway, Render, Vercel, etc.):

```bash
pnpm build
# Deploy the dist/ folder and run: node dist/index.js
```

## Troubleshooting

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Check database is running and accessible
- Run `pnpm db:push` to apply migrations

### Authentication Issues

- Ensure `VITE_APP_ID` and `OAUTH_SERVER_URL` are correct
- Clear browser cookies and try again
- Check browser console for error messages

### Missing Translations

- Verify translation keys exist in `client/src/locales/en.json` and `ar.json`
- Check i18n context is properly wrapped around the app

### Storage Upload Issues

- Verify AWS S3 credentials are configured
- Check file size is under 50MB limit
- Ensure file type is supported (PDF, DOCX, TXT)

## Performance Optimization

- Images and media are stored in S3, not in the repository
- Database queries are optimized with proper indexing
- Frontend uses code splitting and lazy loading
- Animations are GPU-accelerated with transform and opacity

## Security Considerations

- All API routes require authentication (except public FAQs)
- Role-based access control is enforced on the backend
- Passwords are hashed using bcrypt
- JWT tokens expire after 24 hours
- CORS is configured for the frontend domain
- SQL injection is prevented with parameterized queries

## Contributing

When adding new features:

1. Update the database schema in `drizzle/schema.ts`
2. Generate migrations: `pnpm drizzle-kit generate`
3. Create backend routers in `server/routers/`
4. Create frontend pages in `client/src/pages/`
5. Update translations in `client/src/locales/`
6. Write tests in `server/*.test.ts`
7. Run `pnpm check` to verify TypeScript types

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Review the code comments and documentation
3. Check browser console for error messages
4. Review server logs in `.manus-logs/`

## License

MIT
