import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { CalendarCheck, GraduationCap, TrendingUp, UserPlus, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { averageOf, gradeFor, studentsQueryOptions } from "@/lib/students";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard | Student Management System" },
      {
        name: "description",
        content:
          "Dashboard overview of total students, average marks and average attendance for the department.",
      },
      { property: "og:title", content: "Dashboard | Student Management System" },
      {
        property: "og:description",
        content: "Total students, average marks and average attendance at a glance.",
      },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(studentsQueryOptions);
  },
  component: Dashboard,
  errorComponent: ({ error }) => (
    <div className="page-shell" role="alert">
      <p className="text-sm text-destructive">{error.message}</p>
    </div>
  ),
});

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint: string;
  icon: typeof Users;
}) {
  return (
    <div className="surface-panel p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-4xl font-semibold text-foreground">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
        </div>
        <span className="flex size-11 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
          <Icon className="size-5" />
        </span>
      </div>
    </div>
  );
}

function Dashboard() {
  const { data: students } = useSuspenseQuery(studentsQueryOptions);

  const avgMarks = averageOf(students.map((s) => s.marks));
  const avgAttendance = averageOf(students.map((s) => s.attendance));
  const lowAttendance = students.filter((s) => s.attendance < 75).length;
  const recent = [...students]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 5);

  return (
    <div className="page-shell">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">Dashboard</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Live summary of every student record stored in the database.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/students">View Students</Link>
          </Button>
          <Button asChild>
            <Link to="/students/new">
              <UserPlus className="size-4" />
              Add Student
            </Link>
          </Button>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Total Students"
          value={String(students.length)}
          hint="Records in the database"
          icon={Users}
        />
        <StatCard
          label="Average Marks"
          value={`${avgMarks.toFixed(2)}%`}
          hint={`Class grade ${gradeFor(avgMarks)}`}
          icon={TrendingUp}
        />
        <StatCard
          label="Average Attendance"
          value={`${avgAttendance.toFixed(2)}%`}
          hint={`${lowAttendance} student(s) below 75%`}
          icon={CalendarCheck}
        />
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-foreground">Recently added students</h2>
        {recent.length === 0 ? (
          <p className="surface-panel mt-4 p-6 text-sm text-muted-foreground">
            No students yet. Use Add Student to create the first record.
          </p>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {recent.map((student) => (
              <li key={student.id}>
                <Link
                  to="/students/$id"
                  params={{ id: student.id }}
                  className="surface-panel flex items-center gap-4 p-4 transition-shadow hover:shadow-lift"
                >
                  <span className="flex size-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                    <GraduationCap className="size-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-foreground">
                      {student.name}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {student.student_id} &middot; Year {student.year} &middot;{" "}
                      {student.department}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
