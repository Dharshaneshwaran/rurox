# Smart Teacher Class Assignment System

A comprehensive fullstack application for managing teacher schedules, timetables, substitutions, and special classes with admin approval workflow for new teacher registrations.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database (Supabase configured)
- Terminal windows for backend and frontend

### 1. Database Setup (One-time)

```bash
cd backend-nest
npm run seed
```

This creates:
- **Admin Account**: `admin@example.com` / `adminpass`
- **Teacher Accounts**: `alice@example.com` / `teacherpass`, `bob@example.com` / `teacherpass`

### 2. Start Development Servers

**Terminal 1 - Backend**
```bash
cd backend-nest
npm run start:dev
```
Runs on `http://localhost:4000`

**Terminal 2 - Frontend**
```bash
cd frontend1
npm run dev
```
Runs on `http://localhost:3000`

---

## 📋 User Credentials

### Admin Account (Full System Access)
- **Email**: `admin@example.com`
- **Password**: `adminpass`
- **Role**: Administrator - Manage all teachers, approve user signups, view all timetables

### Pre-Approved Teacher Accounts (Demo)
- **Email**: `alice@example.com`
- **Password**: `teacherpass`
- **Email**: `bob@example.com`
- **Password**: `teacherpass`

### New Teacher Registration
- Teachers can sign up at `/teacher/signup`
- Account requires admin approval before login
- Admins review pending signups in User Management panel

---

## 📖 User Workflows

### Admin Workflow

1. **Login**: Go to `http://localhost:3000` → "Continue as Admin" → Use admin credentials
   
2. **Main Dashboard** (`/admin/dashboard`)
   - View all teacher timetables
   - Create/edit timetables
   - Manage teacher assignments
   - Filter by teacher, subject, or class

3. **User Management** (`/admin/users`)
   - **Pending Approvals Tab**:
     - View teacher signup requests
     - Approve new teachers (creates Teacher record)
     - Reject signups (delete user)
   - **All Users Tab**:
     - View all system users
     - See approval status
     - Delete users (admin-only users cannot be deleted)

4. **Substitution Management** (`/admin/substitutions`)
   - Assign replacement teachers
   - View substitution history
   - Auto-assign substitutions by workload

---

### Teacher Workflow

#### For New Teachers (Signup)

1. Go to `http://localhost:3000` → "Continue as Teacher" → "Sign up"
2. Enter: Name, Email, Password (min 6 chars)
3. Submit → Account created (pending approval)
4. **Wait for admin approval**
5. Once approved, return to login (`/teacher/login`)
6. Sign in with the same credentials

#### For Approved Teachers (Dashboard)

1. **Login**: Go to `http://localhost:3000` → "Continue as Teacher" → Use credentials
   
2. **View Schedule** (`/teacher/dashboard`)
   - See weekly timetable (Monday-Friday)
   - View all 8 class periods
   - Check assigned subjects and rooms

3. **Add Subject to Free Period**
   - Find a free period (displays "Free +")
   - Click "Free +" button
   - Fill form:
     - **Subject**: (Required) Name of the subject
     - **Class Name**: (Required) Class identifier (e.g., "10A")
     - **Room**: (Optional) Room number
   - Click "Add Subject" to save

4. **View Substitutions**
   - See assigned replacement classes
   - Check details of absences you're covering

5. **Special Classes**
   - View scheduled special events or lessons
   - Optional sessions outside normal timetable

---

## 🏗️ Project Structure

```
smart-teacher-system/
├── frontend1/              # Next.js frontend app
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx (landing page)
│   │   │   ├── admin/
│   │   │   │   ├── login/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── users/        (new - user management)
│   │   │   │   └── substitutions/
│   │   │   └── teacher/
│   │   │       ├── login/
│   │   │       ├── signup/       (new - teacher registration)
│   │   │       └── dashboard/
│   │   ├── components/
│   │   ├── hooks/ (useAuth)
│   │   └── lib/ (api, types)
│   └── package.json
│
├── backend-nest/          # NestJS backend API
│   ├── src/
│   │   ├── main.ts (bootstrap)
│   │   ├── app.module.ts
│   │   ├── auth/         (login/signup)
│   │   ├── admin/        (new - user management)
│   │   ├── teachers/
│   │   ├── timetables/
│   │   ├── substitutions/
│   │   ├── special-classes/
│   │   └── prisma/ (database service)
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts (database seeding)
│   └── package.json
│
└── .github/
    └── copilot-instructions.md
```

---

## 🔐 Authentication & Authorization

- **JWT Tokens**: 7-day expiry
- **Role-Based Access Control (RBAC)**:
  - `ADMIN`: Full system access, user approval
  - `TEACHER`: Own timetable management, view substitutions
- **Teacher Approval Workflow**:
  - New signups created with `approved: false`
  - Cannot login until admin approves
  - Admin creates associated Teacher record on approval
  - Approved teachers get `approved: true` flag

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - Teacher signup (creates unapproved user)
- `GET /api/auth/me` - Get current user (requires token)

### User Management (Admin Only)
- `GET /api/admin/users/pending` - Get pending approvals
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users/:id/approve` - Approve teacher
- `DELETE /api/admin/users/:id` - Delete user

### Teachers
- `GET /api/teachers` - Get all teachers (admin only)
- `POST /api/teachers` - Create teacher (admin only)
- `PUT /api/teachers/:id` - Update teacher
- `DELETE /api/teachers/:id` - Delete teacher

### Timetables
- `GET /api/timetables` - Get all (admin only)
- `GET /api/timetables/mine` - Get own (teachers)
- `POST /api/timetables` - Create/add subject (teachers + admin)

### Substitutions
- `GET /api/substitutions` - Get all
- `POST /api/substitutions/manual` - Manual assignment
- `POST /api/substitutions/auto` - Auto-assign

### Special Classes
- `GET /api/special-classes` - Get all
- `POST /api/special-classes` - Create new

---

## 🔄 Deployment

### Frontend (Vercel)
```bash
# Set environment variable
NEXT_PUBLIC_API_URL=https://your-backend-url.com

# Deploy
npx vercel deploy
```

### Backend (Any Node.js Host)
Set environment variables:
- `DATABASE_URL` - PostgreSQL connection string (with pooling)
- `DIRECT_URL` - PostgreSQL direct URL (for migrations)
- `JWT_SECRET` - Secret key for JWT signing
- `CORS_ORIGIN` - Frontend URL for CORS
- `PORT` - Server port (default: 4000)

---

## 🛠️ Development

### Database Migrations
```bash
# Push schema changes to database
npm run prisma:push

# Generate Prisma client
npm run prisma:generate
```

### Code Quality
```bash
# Lint code
npm run lint

# Format code
npm run format

# Run tests
npm run test
```

---

## 🎯 Key Features

✅ Admin dashboard with full timetable management
✅ Teacher self-service subject addition
✅ Admin approval workflow for new signups
✅ User management panel (approve/delete)
✅ Automatic and manual substitution assignment
✅ Special classes scheduling
✅ JWT-based authentication with RBAC
✅ PostgreSQL database with Prisma ORM
✅ Responsive Tailwind CSS UI

---

## 📝 Notes

- Teachers can only manage their own timetables
- Admins have universal access to all data
- Deleting a user also deletes associated records (timetables, substitutions, special classes)
- Database connections use Supabase (PostgreSQL)
- Seed data can be rerun anytime (uses upsert for idempotency)

---

## 🆘 Troubleshooting

**Backend won't start**
- Check `.env` file has `DATABASE_URL` and `DIRECT_URL`
- Run `npm install` in `backend-nest/`
- Verify PostgreSQL is accessible

**Login fails with "pending admin approval"**
- Account hasn't been approved yet
- Admin must go to User Management and click "Approve"

**Teacher signup doesn't work**
- Verify backend is running on port 4000
- Check browser console for API errors
- Ensure email isn't already registered

**Timetable changes not showing**
- Hard refresh browser (Ctrl+F5)
- Check that you're logged in as the correct teacher
- Verify network tab shows successful API call

---

## 📞 Support

For issues or questions, check:
- Backend logs: Terminal running `npm run start:dev`
- Frontend console: Browser DevTools
- Database: Supabase dashboard

---

**Last Updated**: March 2026
**Version**: 1.0.0
