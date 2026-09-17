OUTPUT:https://snap-shot-magic-35.lovable.app/students
# Student Management System

A complete CRUD-based web application for managing student records, built as a B.Tech
Artificial Intelligence and Data Science college mini project.

## Project Description

The Student Management System lets a department maintain student records in a persistent
PostgreSQL database. Staff can add students, view all records in a searchable table, open a
single student profile, edit details, and delete records with a confirmation step. A dashboard
summarises the total number of students, average marks, and average attendance.

## Features

- Dashboard with total students, average marks and average attendance
- Add a new student with full form validation
- View all students in a responsive, searchable table
- Search by student ID, name, department, email or phone number
- Student details page with attendance/marks progress and grade
- Edit an existing student record
- Delete a student with a confirmation dialog
- Success and error notifications (toasts)
- Grade calculation and low-attendance (< 75%) highlighting
- Fully responsive design for mobile, tablet and desktop

## Technologies Used

- React 19
- TypeScript
- TanStack Start (React framework, file-based routing, SSR)
- TanStack Query (data fetching and cache invalidation)
- Tailwind CSS v4 with a semantic design-token system
- shadcn/ui components and lucide-react icons
- Zod for schema validation
- Sonner for toast notifications
- Vite 7 build tooling

## Database Used

Supabase PostgreSQL (provisioned through Lovable Cloud).

### `students` table

| Column       | Type          | Notes                       |
| ------------ | ------------- | --------------------------- |
| `id`         | uuid          | Primary key                 |
| `student_id` | text          | Unique student ID           |
| `name`       | text          | Student name                |
| `department` | text          | Department                  |
| `year`       | integer       | 1–4                         |
| `email`      | text          | Email address               |
| `phone`      | text          | 10-digit phone number       |
| `attendance` | numeric(5,2)  | 0–100                       |
| `marks`      | numeric(5,2)  | 0–100                       |
| `created_at` | timestamptz   | Auto-set                    |
| `updated_at` | timestamptz   | Auto-updated by trigger     |

Row Level Security is enabled, with policies that allow the app to read, insert, update and
delete student records. Five sample student records are seeded for testing.

## CRUD Operations

| Operation | Page               | Route                 | Database action                    |
| --------- | ------------------ | --------------------- | ---------------------------------- |
| Create    | Add Student        | `/students/new`       | `INSERT` into `students`            |
| Read      | Dashboard / View   | `/`, `/students`      | `SELECT` all records                |
| Read one  | Student Details    | `/students/:id`       | `SELECT` a single record            |
| Update    | Edit Student       | `/students/:id/edit`  | `UPDATE` the record                 |
| Delete    | View / Details     | `/students`, details  | `DELETE` after confirmation         |

## Validation Rules

- Student ID: required, unique, letters/numbers/hyphens only
- Student name: required, 2–100 characters
- Department: required (chosen from a list)
- Year: required, between 1 and 4
- Email: required, must be a valid email address
- Phone number: required, exactly 10 digits
- Attendance: required, between 0 and 100
- Marks: required, between 0 and 100

Duplicate Student IDs are rejected by the database unique constraint and reported with a clear
error message.

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```
2. Ensure the environment variables for the database connection exist in `.env`:
   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_PUBLISHABLE_KEY=...
   ```
   (These are created automatically when the project's cloud backend is enabled.)
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open the app in the browser at the printed local URL.
5. Build for production:
   ```bash
   npm run build
   ```

## Pages

1. **Dashboard** (`/`) — statistics and recently added students
2. **View Students** (`/students`) — searchable table with all actions
3. **Add Student** (`/students/new`) — validated create form
4. **Student Details** (`/students/:id`) — single student profile
5. **Edit Student** (`/students/:id/edit`) — validated update form
