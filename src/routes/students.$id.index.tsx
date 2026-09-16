import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Mail, Pencil, Phone, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { deleteStudent, gradeFor, studentQueryOptions } from "@/lib/students";

export const Route = createFileRoute("/students/$id/")({
  head: () => ({
    meta: [
      { title: "Student Details | Student Management System" },
      {
        name: "description",
        content: "Full profile for a student including contact details, attendance and marks.",
      },
      { property: "og:title", content: "Student Details | Student Management System" },
      {
        property: "og:description",
        content: "Contact details, attendance percentage and marks for a single student.",
      },
    ],
  }),
  loader: ({ context, params }) => {
    context.queryClient.ensureQueryData(studentQueryOptions(params.id));
  },
  component: StudentDetails,
  errorComponent: ({ error }) => (
    <div className="page-shell" role="alert">
      <p className="text-sm text-destructive">{error.message}</p>
      <Button asChild className="mt-4">
        <Link to="/students">Back to students</Link>
      </Button>
    </div>
  ),
  notFoundComponent: () => <div className="page-shell">Student not found.</div>,
});

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-border py-3 last:border-0">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}

function StudentDetails() {
  const { id } = Route.useParams();
  const { data: student } = useSuspenseQuery(studentQueryOptions(id));
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const removeStudent = useMutation({
    mutationFn: () => deleteStudent(student.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Student deleted successfully");
      navigate({ to: "/students" });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="page-shell max-w-4xl">
      <Link
        to="/students"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to students
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">{student.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {student.student_id} &middot; Year {student.year} &middot; {student.department}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/students/$id/edit" params={{ id: student.id }}>
              <Pencil className="size-4" />
              Edit
            </Link>
          </Button>
          <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
            <Trash2 className="size-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="surface-panel p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Attendance</p>
            <Badge variant={student.attendance < 75 ? "destructive" : "secondary"}>
              {student.attendance < 75 ? "Below requirement" : "Eligible"}
            </Badge>
          </div>
          <p className="mt-2 text-3xl font-semibold">{student.attendance.toFixed(2)}%</p>
          <Progress value={student.attendance} className="mt-4" />
        </div>

        <div className="surface-panel p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Marks</p>
            <Badge variant={student.marks < 50 ? "destructive" : "secondary"}>
              Grade {gradeFor(student.marks)}
            </Badge>
          </div>
          <p className="mt-2 text-3xl font-semibold">{student.marks.toFixed(2)}</p>
          <Progress value={student.marks} className="mt-4" />
        </div>
      </div>

      <div className="surface-panel mt-4 p-6">
        <h2 className="text-lg font-semibold">Student Information</h2>
        <dl className="mt-2">
          <DetailRow label="Student ID" value={student.student_id} />
          <DetailRow label="Student Name" value={student.name} />
          <DetailRow label="Department" value={student.department} />
          <DetailRow label="Year" value={`Year ${student.year}`} />
          <DetailRow label="Email" value={student.email} />
          <DetailRow label="Phone Number" value={student.phone} />
        </dl>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <a href={`mailto:${student.email}`}>
              <Mail className="size-4" />
              Email
            </a>
          </Button>
          <Button asChild variant="outline" size="sm">
            <a href={`tel:${student.phone}`}>
              <Phone className="size-4" />
              Call
            </a>
          </Button>
        </div>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this student?</AlertDialogTitle>
            <AlertDialogDescription>
              {`${student.name} (${student.student_id}) will be permanently removed from the database. This cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removeStudent.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={removeStudent.isPending}
              onClick={(event) => {
                event.preventDefault();
                removeStudent.mutate();
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
