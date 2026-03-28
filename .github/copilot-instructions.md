<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->
- [x] Verify that the copilot-instructions.md file in the .github directory is created.

- [x] Clarify Project Requirements
	Smart Teacher Class Assignment System - fullstack monorepo with Next.js frontend and NestJS backend, PostgreSQL database.

- [x] Scaffold the Project
	Monorepo structure created with frontend1 (Next.js), backend-nest (NestJS), and root configuration files.

- [x] Customize the Project
	Implemented admin and teacher dashboards with authentication, timetable management, substitutions, special classes, and teacher self-service subject addition.

- [x] Install Required Extensions
	No additional extensions required for VS Code workspace.

- [x] Compile the Project
	Frontend1 and backend-nest both compile without errors. Prisma schema synced to Supabase PostgreSQL.

- [x] Create and Run Task
	Backend: Run `npm run start:dev` in backend-nest folder for development mode
	Frontend: Run `npm run dev` in frontend1 folder for Next.js dev server
	Database: PostgreSQL on Supabase, seed with `npm run seed` in backend-nest

- [x] Launch the Project
	See "Running the Application" section below

- [x] Ensure Documentation is Complete
	README.md and this instructions file are current. All HTML comments removed.

## Running the Application

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database (Supabase configured in `.env`)
- Terminal windows for running backend and frontend

### Database Setup (One-time)
```bash
cd backend-nest
npm run seed
```
This seeds the database with:
- Admin user: `admin@example.com` / `adminpass`
- Teacher users: `alice@example.com` / `teacherpass`, `bob@example.com` / `teacherpass`

### Development Servers

**Terminal 1 - Backend (NestJS)**
```bash
cd backend-nest
npm run start:dev
```
Runs on `http://localhost:4000`

**Terminal 2 - Frontend (Next.js)**
```bash
cd frontend1
npm run dev
```
Runs on `http://localhost:3000`

### Testing the Subject Addition Feature

1. Log in as a teacher: `alice@example.com` / `teacherpass`
2. Go to Teacher Dashboard
3. Find a free period (shows "Free +")
4. Click "Free +" to open the Add Subject modal
5. Fill in subject, className, and room (optional)
6. Click "Add Subject" to save
7. The timetable will refresh with the new subject

## Key Features

- **Admin Dashboard**: Manage teachers, view/edit all timetables, manage substitutions
- **Teacher Dashboard**: View personal schedule, add subjects to free periods, manage special classes
- **Substitution Management**: Automatic and manual teacher substitution assignment
- **Special Classes**: Schedule special events or lessons
