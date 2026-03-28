# Substitute Teacher Management System

A comprehensive, modern web application designed to streamline the process of managing teacher absences and finding optimal substitute teachers. The system intelligently suggests replacements based on subject expertise and current workloads, ensuring that classes are always covered efficiently.

Built with a robust **NestJS (Node.js)** backend and a sleek, modern **Next.js (React)** frontend.

---

## 🌟 Key Features

- **Intelligent Substitute Suggestions**: When a teacher is marked absent for the day, the system algorithmically suggests the best available substitute for each period by matching subjects and prioritizing teachers with lower workloads.
- **Full-Day Absence Workflow**: A streamlined 3-step admin process (Select Teacher -> Review Suggestions -> Confirm) allows principals to handle a full day's absence in seconds.
- **Professional Admin Dashboard**: A clean, sidebar-based layout featuring a Teacher Directory and detailed individual timetable views.
- **Teacher Portals**: Dedicated portals for teachers to view their personal weekly timetables and see any requested substitute coverages.
- **Advanced Per-Period Management**: Tools for granular control over single-period automatic or manual substitution assignments.

---

## 🏗️ Architecture

- **Backend**: NestJS, Prisma ORM, PostgreSQL. (Located in `/backend-nest`)
- **Frontend**: Next.js 14, React, Tailwind CSS. (Located in `/frontend1`)

---

## 🖥️ Frontend Pages & Purposes

Here is a breakdown of all the pages available in the frontend application and their roles:

### Public Pages
- **`/` (Home)**: The main landing page providing quick access to the Admin and Teacher login portals.
- **`/register`**: The registration portal where new teachers can create an account (accounts require admin approval before logging in).
- **`/admin/login`**: Secure login page for school administrators/principals.
- **`/teacher/login`**: Secure login page for teachers.

### Admin Portal (`/admin/*`)
*Protected routes accessible only to users with the `ADMIN` role.*

- **`/admin/dashboard`**: The main hub for administrators. It displays a **Teacher Directory Grid**, giving a quick overview of all faculty members, their assigned subjects, and their current workload.
- **`/admin/teachers/[id]`**: A detailed profile for an individual teacher. It features an interactive **Timetable Grid** displaying the teacher's schedule across the week, allowing admins to easily view and edit classes.
- **`/admin/substitutions`**: The core absence management center. 
  - Features the **Full-Day Absence Flow**: Mark a teacher absent, review automated substitute suggestions for all their classes, and confirm the batch.
  - Includes an **Advanced Management** section for manual, period-by-period substitution overrides.
- **`/admin/users`**: The user management interface where administrators can review, approve, or delete pending teacher registrations.

### Teacher Portal (`/teacher/*`)
*Protected routes accessible only to users with the `TEACHER` role.*

- **`/teacher/dashboard`**: The teacher's personal workspace. It displays their schedule for the day, highlights their free periods, and prominently alerts them of any substitute classes they are required to cover due to absent colleagues.

---

## 🚀 Getting Started

Provide instructions here on how to set up the environment variables, run database migrations, and start both the backend and frontend servers.
