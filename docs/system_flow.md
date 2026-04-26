# Ruroxz School ERP - System Flow Documentation

This document outlines the primary user flows and system architecture for the Ruroxz platform.

## System Architecture Overview

```mermaid
graph TD
    %% Entry Point
    Start((Open Ruroxz)) --> Login{Login}
    
    %% Authentication Flow
    Login -- Invalid --> Error[Show Error / Retry]
    Login -- Valid --> Auth[Verify Role & Permissions]
    
    %% Role Branching
    Auth --> RoleDecision{User Role?}
    
    %% Admin Flow
    RoleDecision -- ADMIN --> AdminDash[Admin Dashboard]
    AdminDash --> UserMgmt[User Management]
    AdminDash --> ClassMgmt[Class & Timetable Mgmt]
    AdminDash --> SubEngine[Substitution Orchestrator]
    
    UserMgmt --> ApproveTeacher[Approve Teacher Requests]
    ClassMgmt --> AssignTimetable[Assign Weekly Timetable]
    
    %% Substitution Flow (Core Logic)
    SubEngine --> SelectAbsence[Select Absent Teacher & Date]
    SelectAbsence --> Analyze[Analyzing...]
    Analyze --> CandidateLogic{Find Best Candidates}
    CandidateLogic --> WorkloadCheck[Check Teacher Workload]
    CandidateLogic --> SubjectMatch[Check Subject Expertise]
    CandidateLogic --> FreeSlot[Check Timetable Availability]
    
    WorkloadCheck & SubjectMatch & FreeSlot --> Suggestion[Generate Optimized Suggestions]
    Suggestion --> ConfirmSub[Confirm & Notify Substitutes]
    
    %% Teacher Flow
    RoleDecision -- TEACHER --> TeacherDash[Teacher Workspace]
    TeacherDash --> ViewTimetable[View Weekly Schedule]
    TeacherDash --> ManageStudents[Student Directory]
    TeacherDash --> SubAlerts[Substitution Requests]
    
    SubAlerts --> AcceptReject{Accept or Reject?}
    AcceptReject -- Accept --> UpdateWorkload[Increment Workload Count]
    AcceptReject -- Reject --> AdminNotify[Notify Admin for Reassignment]
    
    %% Student Flow
    RoleDecision -- STUDENT --> StudentDash[Student Hub]
    StudentDash --> MyAttendance[Attendance Tracking]
    StudentDash --> ViewNotices[School Notice Board]
    StudentDash --> ReportCard[Digital Progress Report]
    StudentDash --> LeaveReq[Submit Leave Requests]
    
    %% UI Modes
    AdminDash -.-> ThemeToggle{Theme Switcher}
    ThemeToggle -.-> ModernUI[Premium Modern UI]
    ThemeToggle -.-> LegacyUI[Legacy Legacy Theme]

    %% Styling
    style SubEngine fill:#4f46e5,color:#fff,stroke:#312e81
    style CandidateLogic fill:#f59e0b,color:#fff
    style Auth fill:#10b981,color:#fff
    style RoleDecision fill:#6366f1,color:#fff
```

## Core Modules

### 1. Authentication & Security
- **JWT Implementation**: Secure token-based authentication handled via `AuthGuard`.
- **Role-Based Access Control (RBAC)**: Enforced in both frontend (Layout shells) and backend (RolesGuard).
- **Approval Workflow**: New teachers must be approved by an Admin before they can access the dashboard.

### 2. Substitution Orchestrator
The `SubstitutionsService` is the heart of the automation logic. It solves the "Absence Gap" problem by:
- **Filtering**: Removing the absent teacher and anyone already scheduled for a class.
- **Ranking**: Sorting candidates by `workload` (ascending) and `subjectMatch` (descending).
- **Cascading**: Handling cases where a single teacher absence affects multiple periods throughout the day.

### 3. Relational Data Model (Prisma)
- **SchoolClass Node**: Acts as the bridge between Teachers (Timetable) and Students (Roster).
- **Cascading Deletes**: Ensures that when a substitution is cancelled, workload counts are correctly decremented.

### 4. Responsive Design System
- **Mobile-First Layouts**: Sidebar drawers and card-based data views.
- **Tabbed Timetables**: A specialized mobile view for complex schedules.
- **Theme Engine**: Support for Modern (Indigo) and Legacy (Green) aesthetics via CSS variables.

---
*Last Updated: April 2026*
